import { Injectable, Logger, OnModuleInit, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdPlacementDto } from './dto/create-ad-placement.dto';
import { UpdateAdPlacementDto } from './dto/update-ad-placement.dto';
import { UpdateGlobalAdsConfigDto, UpdateAdsTxtDto, TrackAdEventDto } from './dto/update-global-ads-config.dto';

@Injectable()
export class AdsService implements OnModuleInit {
  private readonly logger = new Logger(AdsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaultPlacementsAndSettings();
  }

  /**
   * Seed standard ad placements and system settings if not present
   */
  private async seedDefaultPlacementsAndSettings() {
    try {
      // 1. Seed standard placement slots
      const defaultSlots = [
        {
          name: 'Home Top Leaderboard Banner',
          slug: 'home-top-banner',
          network: 'GOOGLE_ADSENSE',
          status: 'PAUSED',
          format: 'RESPONSIVE',
          order: 1,
        },
        {
          name: 'Article Top Leaderboard',
          slug: 'article-header',
          network: 'GOOGLE_ADSENSE',
          status: 'PAUSED',
          format: 'RESPONSIVE',
          order: 2,
        },
        {
          name: 'Article Sticky Sidebar',
          slug: 'article-sidebar',
          network: 'CARBON_ADS',
          status: 'PAUSED',
          format: 'RECTANGLE_300x250',
          order: 3,
        },
        {
          name: 'In-Article Native Break',
          slug: 'article-in-content-1',
          network: 'GOOGLE_ADSENSE',
          status: 'PAUSED',
          format: 'IN_ARTICLE',
          order: 4,
        },
        {
          name: 'Home Mid-Feed Sponsor Banner',
          slug: 'home-mid-feed',
          network: 'CUSTOM_IMAGE',
          status: 'PAUSED',
          format: 'BANNER_728x90',
          order: 5,
        },
        {
          name: 'Global Footer Sponsor Banner',
          slug: 'footer-banner',
          network: 'CUSTOM_IMAGE',
          status: 'PAUSED',
          format: 'BANNER_728x90',
          order: 6,
        },
      ];

      for (const slot of defaultSlots) {
        const existing = await this.prisma.adPlacement.findUnique({ where: { slug: slot.slug } });
        if (!existing) {
          await this.prisma.adPlacement.create({
            data: slot as any,
          });
          this.logger.log(`Seeded default ad placement: ${slot.name} (${slot.slug})`);
        } else {
          const legacySlotIds: Record<string, string> = {
            'home-top-banner': '1092837466',
            'article-header': '1092837465',
            'article-in-content-1': '5647382910',
          };
          if (legacySlotIds[slot.slug] === existing.slotId) {
            await this.prisma.adPlacement.update({
              where: { id: existing.id },
              data: { slotId: null, status: 'PAUSED' },
            });
          }
          if (
            ['home-mid-feed', 'footer-banner'].includes(slot.slug) &&
            existing.customImage === 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=728&h=90&fit=crop&q=80' &&
            existing.customUrl === 'https://nexusnation.in'
          ) {
            await this.prisma.adPlacement.update({
              where: { id: existing.id },
              data: { customImage: null, customUrl: null, status: 'PAUSED' },
            });
          }
        }
      }

      // 2. Seed default system settings for ad control
      const defaultSettings: Record<string, string> = {
        ads_global_enabled: 'false',
        ads_google_adsense_enabled: 'false',
        ads_google_adsense_client_id: '',
        ads_carbon_enabled: 'false',
        ads_carbon_serve_id: '',
        ads_carbon_placement: '',
        ads_ethical_ads_enabled: 'false',
        ads_ethical_ads_publisher_id: '',
        ads_adsterra_enabled: 'false',
        ads_hide_for_logged_in: 'false',
        ads_interstitial_enabled: 'false',
        ads_interstitial_timer_seconds: '5',
        ads_interstitial_frequency_minutes: '10',
        ads_interstitial_network: 'CUSTOM_HTML',
        ads_interstitial_custom_html: '',
        ads_interstitial_custom_image: '',
        ads_interstitial_custom_url: '',
        ads_interstitial_title: 'Sponsored Architecture Briefing',
        ads_txt_content: '# NexusNation Ads.txt — add only seller accounts authorized for this domain\n',
      };

      for (const [key, value] of Object.entries(defaultSettings)) {
        const existingSetting = await this.prisma.systemSetting.findUnique({ where: { key } });
        if (!existingSetting) {
          await this.prisma.systemSetting.create({
            data: {
              key,
              value,
              description: `Configuration setting for ${key}`,
            },
          });
        }
      }

      // Clean up the exact sample values written by older versions without overwriting admin edits.
      const legacyPublisher = await this.prisma.systemSetting.findUnique({ where: { key: 'ads_google_adsense_client_id' } });
      if (legacyPublisher?.value === 'ca-pub-9847291823746501') {
        await this.prisma.systemSetting.updateMany({
          where: { key: 'ads_google_adsense_enabled' },
          data: { value: 'false' },
        });
        await this.prisma.systemSetting.update({
          where: { key: 'ads_google_adsense_client_id' },
          data: { value: '' },
        });
      }

      const legacyAdsTxt = await this.prisma.systemSetting.findUnique({ where: { key: 'ads_txt_content' } });
      if (legacyAdsTxt) {
        const cleanedAdsTxt = legacyAdsTxt.value
          .split(/\r?\n/)
          .filter((line) =>
            !line.trim().startsWith('google.com, pub-9847291823746501,') &&
            !line.trim().startsWith('buysellads.com, pub-19283746,'),
          )
          .join('\n');
        if (cleanedAdsTxt !== legacyAdsTxt.value) {
          await this.prisma.systemSetting.update({
            where: { key: 'ads_txt_content' },
            data: { value: cleanedAdsTxt.trim() ? `${cleanedAdsTxt.trim()}\n` : defaultSettings.ads_txt_content },
          });
        }
      }

      const legacyCarbon = await this.prisma.systemSetting.findUnique({ where: { key: 'ads_carbon_serve_id' } });
      if (legacyCarbon?.value === 'CEBD42Q') {
        await this.prisma.systemSetting.updateMany({
          where: { key: 'ads_carbon_enabled' },
          data: { value: 'false' },
        });
        await this.prisma.systemSetting.updateMany({
          where: { key: { in: ['ads_carbon_serve_id', 'ads_carbon_placement'] } },
          data: { value: '' },
        });
      }

      const legacyEthicalPublisher = await this.prisma.systemSetting.findUnique({ where: { key: 'ads_ethical_ads_publisher_id' } });
      if (legacyEthicalPublisher?.value === 'nexus-developer-blog') {
        await this.prisma.systemSetting.updateMany({
          where: { key: 'ads_ethical_ads_enabled' },
          data: { value: 'false' },
        });
        await this.prisma.systemSetting.update({
          where: { key: 'ads_ethical_ads_publisher_id' },
          data: { value: '' },
        });
      }

      const legacyInterstitial = await this.prisma.systemSetting.findUnique({ where: { key: 'ads_interstitial_custom_html' } });
      if (legacyInterstitial?.value.includes('bendspecimen.com/bd678b45243cf1ba0c91ec1cfad866d2')) {
        await Promise.all([
          this.prisma.systemSetting.update({
            where: { key: 'ads_interstitial_custom_html' },
            data: { value: '' },
          }),
          this.prisma.systemSetting.updateMany({
            where: { key: 'ads_interstitial_enabled' },
            data: { value: 'false' },
          }),
        ]);
      }
    } catch (err: any) {
      this.logger.debug(`Error initializing ad placements: ${err.message}`);
    }
  }

  // ==========================================
  // PUBLIC ENDPOINTS
  // ==========================================

  /**
   * 1. Public ad configuration for web clients
   */
  async getPublicConfig() {
    const settings = await this.prisma.systemSetting.findMany({
      where: { key: { startsWith: 'ads_' } },
    });

    const configMap: Record<string, string> = {};
    settings.forEach((s) => {
      configMap[s.key] = s.value;
    });

    return {
      globalEnabled: configMap['ads_global_enabled'] === 'true',
      hideForLoggedIn: configMap['ads_hide_for_logged_in'] === 'true',
      googleAdsense: {
        enabled: configMap['ads_google_adsense_enabled'] === 'true' && /^ca-pub-\d{16}$/.test(configMap['ads_google_adsense_client_id'] || ''),
        clientId: configMap['ads_google_adsense_client_id'] || '',
      },
      carbon: {
        enabled: configMap['ads_carbon_enabled'] === 'true',
        serveId: configMap['ads_carbon_serve_id'] || '',
        placement: configMap['ads_carbon_placement'] || '',
      },
      ethicalAds: {
        enabled: configMap['ads_ethical_ads_enabled'] === 'true' && Boolean(configMap['ads_ethical_ads_publisher_id']?.trim()),
        publisherId: configMap['ads_ethical_ads_publisher_id'] || '',
      },
      adsterra: {
        enabled: configMap['ads_adsterra_enabled'] === 'true',
      },
      interstitial: {
        enabled: configMap['ads_interstitial_enabled'] === 'true',
        timerSeconds: Number(configMap['ads_interstitial_timer_seconds'] || '5'),
        frequencyMinutes: Number(configMap['ads_interstitial_frequency_minutes'] || '10'),
        network: configMap['ads_interstitial_network'] || 'CUSTOM_HTML',
        customHtml: configMap['ads_interstitial_custom_html'] || '',
        customImage: configMap['ads_interstitial_custom_image'] || '',
        customUrl: configMap['ads_interstitial_custom_url'] || '',
        title: configMap['ads_interstitial_title'] || 'Sponsored Architecture Briefing',
      },
    };
  }

  /**
   * 2. Public active placements
   */
  async getPublicPlacements(path?: string) {
    const globalConfig = await this.getPublicConfig();
    if (!globalConfig.globalEnabled) {
      return [];
    }

    const enabledNetworks = new Set([
      ...(globalConfig.googleAdsense.enabled ? ['GOOGLE_ADSENSE'] : []),
      ...(globalConfig.carbon.enabled ? ['CARBON_ADS'] : []),
      ...(globalConfig.ethicalAds.enabled ? ['ETHICAL_ADS'] : []),
      ...(globalConfig.adsterra.enabled ? ['ADSTERRA'] : []),
      'CUSTOM_HTML',
      'CUSTOM_IMAGE',
    ]);

    const placements = (await this.prisma.adPlacement.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { order: 'asc' },
    })).filter((placement) => {
      if (!enabledNetworks.has(placement.network)) return false;
      if (!this.isPlacementReadyForServing(placement, globalConfig)) return false;
      if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) return true;
      const excludePaths = Array.isArray(placement.excludePaths) ? placement.excludePaths : [];
      return !excludePaths.some((excludedPath) => {
        if (typeof excludedPath !== 'string') return false;
        const excluded = excludedPath.replace(/\/+$/, '') || '/';
        return path === excluded || (excluded !== '/' && path.startsWith(`${excluded}/`));
      });
    });

    // EthicalAds requires one unit and no competing third-party ads on a page.
    const ethicalPlacement = placements.find((placement) => placement.network === 'ETHICAL_ADS');
    return ethicalPlacement ? [ethicalPlacement] : placements;
  }

  private isPlacementReadyForServing(placement: any, config: Awaited<ReturnType<AdsService['getPublicConfig']>>) {
    switch (placement.network) {
      case 'GOOGLE_ADSENSE':
        return Boolean(
          /^ca-pub-\d{16}$/.test(config.googleAdsense.clientId) &&
          (!placement.clientOrPublisherId || placement.clientOrPublisherId === config.googleAdsense.clientId) &&
          placement.slotId,
        );
      case 'CARBON_ADS':
        return Boolean((placement.slotId || config.carbon.serveId) && (placement.clientOrPublisherId || config.carbon.placement));
      case 'ETHICAL_ADS':
        return Boolean(
          config.ethicalAds.publisherId &&
          (!placement.clientOrPublisherId || placement.clientOrPublisherId === config.ethicalAds.publisherId),
        );
      case 'ADSTERRA':
        return this.isValidAdsterraPlacement(placement);
      case 'CUSTOM_HTML':
        return Boolean(placement.customHtml?.trim());
      case 'CUSTOM_IMAGE':
        return this.isHttpUrl(placement.customImage) && this.isHttpUrl(placement.customUrl);
      default:
        return false;
    }
  }

  private async assertPlacementReady(placement: any) {
    if (placement.status !== 'ACTIVE') return;
    if (!this.isPlacementReadyForServing(placement, await this.getPublicConfig())) {
      throw new BadRequestException(`Complete valid publisher, slot, or creative details before activating this ${placement.network} placement`);
    }
  }

  /**
   * 3. Get single placement by slug
   */
  async getPlacementBySlug(slug: string) {
    const placement = await this.prisma.adPlacement.findUnique({ where: { slug } });
    if (!placement) throw new NotFoundException(`Placement ${slug} not found`);
    return placement;
  }

  /**
   * 4. Serve dynamic ads.txt content
   */
  async getAdsTxtContent(): Promise<string> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: 'ads_txt_content' },
    });

    return setting?.value || '# NexusNation Ads.txt — add only seller accounts authorized for this domain\n';
  }

  /**
   * 5. Track a viewable ad slot event without blocking the page.
   */
  async trackImpression(dto: TrackAdEventDto) {
    try {
      const placement = await this.prisma.adPlacement.findUnique({
        where: { slug: dto.placementSlug },
        select: { id: true, status: true },
      });

      if (!placement || placement.status !== 'ACTIVE') return { success: true };

      await this.prisma.$transaction([
        this.prisma.adPlacement.update({
          where: { id: placement.id },
          data: { impressionsCount: { increment: 1 } },
        }),
        this.prisma.adImpressionLog.create({
          data: {
            placementId: placement.id,
            visitorId: dto.visitorId || null,
            path: dto.path || null,
          },
        }),
      ]);

      return { success: true };
    } catch (error) {
      this.logger.warn(`Failed to record ad slot view: ${error instanceof Error ? error.message : String(error)}`);
      return { success: true };
    }
  }

  /**
   * 6. Track click non-blocking
   */
  async trackClick(dto: TrackAdEventDto) {
    try {
      const placement = await this.prisma.adPlacement.findUnique({
        where: { slug: dto.placementSlug },
        select: { id: true, status: true, network: true },
      });

      if (!placement || placement.status !== 'ACTIVE' || !['CUSTOM_HTML', 'CUSTOM_IMAGE'].includes(placement.network)) {
        return { success: true };
      }

      await this.prisma.$transaction([
        this.prisma.adPlacement.update({
          where: { id: placement.id },
          data: { clicksCount: { increment: 1 } },
        }),
        this.prisma.adClickLog.create({
          data: {
            placementId: placement.id,
            visitorId: dto.visitorId || null,
            path: dto.path || null,
          },
        }),
      ]);

      return { success: true };
    } catch (error) {
      this.logger.warn(`Failed to record sponsor click: ${error instanceof Error ? error.message : String(error)}`);
      return { success: true };
    }
  }

  // ==========================================
  // ADMIN CONTROL ENDPOINTS
  // ==========================================

  /**
   * 7. Admin: Get all placements with computed CTR analytics
   */
  async getAdminPlacements() {
    const placements = await this.prisma.adPlacement.findMany({
      orderBy: { order: 'asc' },
    });

    return placements.map((p) => {
      const tracksFirstPartyClicks = ['CUSTOM_HTML', 'CUSTOM_IMAGE'].includes(p.network);
      const ctr = tracksFirstPartyClicks && p.impressionsCount > 0
        ? Number(((p.clicksCount / p.impressionsCount) * 100).toFixed(2))
        : tracksFirstPartyClicks ? 0 : null;

      return {
        ...p,
        clicksCount: tracksFirstPartyClicks ? p.clicksCount : null,
        ctr,
      };
    });
  }

  /**
   * 8. Admin: Create new placement
   */
  async createPlacement(dto: CreateAdPlacementDto) {
    const network = dto.network || 'GOOGLE_ADSENSE';
    const status = dto.status || 'ACTIVE';
    const format = dto.format || 'RESPONSIVE';
    if (status === 'ACTIVE') this.validateAdsterraPlacement(network, format, dto.slotId, dto.clientOrPublisherId);
    this.validateCustomImageUrls(network, dto.customImage, dto.customUrl, status);
    if (status === 'ACTIVE' && network === 'GOOGLE_ADSENSE' && format === 'IN_FEED') {
      throw new BadRequestException('Google AdSense IN_FEED placements require a native layout key, which is not configured here');
    }
    await this.assertPlacementReady({ ...dto, network, status, format });
    const existing = await this.prisma.adPlacement.findUnique({ where: { slug: dto.slug } });
    if (existing) {
      throw new BadRequestException(`Placement with slug '${dto.slug}' already exists`);
    }

    return this.prisma.adPlacement.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        network: (dto.network as any) || 'GOOGLE_ADSENSE',
        status: (dto.status as any) || 'ACTIVE',
        format: (dto.format as any) || 'RESPONSIVE',
        slotId: dto.slotId || null,
        clientOrPublisherId: dto.clientOrPublisherId || null,
        customHtml: dto.customHtml || null,
        customImage: dto.customImage || null,
        customUrl: dto.customUrl || null,
        customAlt: dto.customAlt || null,
        excludePaths: dto.excludePaths || [],
        order: dto.order ?? 0,
      },
    });
  }

  /**
   * 9. Admin: Update placement
   */
  async updatePlacement(id: string, dto: UpdateAdPlacementDto) {
    const placement = await this.prisma.adPlacement.findUnique({ where: { id } });
    if (!placement) throw new NotFoundException(`Placement with ID ${id} not found`);

    const updatedPlacement = { ...placement, ...dto };
    if (updatedPlacement.status === 'ACTIVE') {
      this.validateAdsterraPlacement(
        updatedPlacement.network,
        updatedPlacement.format,
        updatedPlacement.slotId,
        updatedPlacement.clientOrPublisherId,
      );
    }
    this.validateCustomImageUrls(
      updatedPlacement.network,
      updatedPlacement.customImage,
      updatedPlacement.customUrl,
      updatedPlacement.status,
    );
    if (updatedPlacement.status === 'ACTIVE' && updatedPlacement.network === 'GOOGLE_ADSENSE' && updatedPlacement.format === 'IN_FEED') {
      throw new BadRequestException('Google AdSense IN_FEED placements require a native layout key, which is not configured here');
    }
    await this.assertPlacementReady(updatedPlacement);

    if (dto.slug && dto.slug !== placement.slug) {
      const conflict = await this.prisma.adPlacement.findUnique({ where: { slug: dto.slug } });
      if (conflict) {
        throw new BadRequestException(`Placement with slug '${dto.slug}' already exists`);
      }
    }

    return this.prisma.adPlacement.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.slug && { slug: dto.slug }),
        ...(dto.network && { network: dto.network as any }),
        ...(dto.status && { status: dto.status as any }),
        ...(dto.format && { format: dto.format as any }),
        ...(dto.slotId !== undefined && { slotId: dto.slotId }),
        ...(dto.clientOrPublisherId !== undefined && { clientOrPublisherId: dto.clientOrPublisherId }),
        ...(dto.customHtml !== undefined && { customHtml: dto.customHtml }),
        ...(dto.customImage !== undefined && { customImage: dto.customImage }),
        ...(dto.customUrl !== undefined && { customUrl: dto.customUrl }),
        ...(dto.customAlt !== undefined && { customAlt: dto.customAlt }),
        ...(dto.excludePaths !== undefined && { excludePaths: dto.excludePaths }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
    });
  }

  private validateAdsterraPlacement(network?: string, format?: string, scriptUrl?: string | null, containerId?: string | null) {
    if (network !== 'ADSTERRA') return;
    if (format !== 'IN_FEED') {
      throw new BadRequestException('Adsterra is configured for inline Native Banner placements only');
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(scriptUrl || '');
    } catch {
      throw new BadRequestException('Adsterra placements require the HTTPS invoke.js URL from the publisher dashboard');
    }

    if (parsedUrl.protocol !== 'https:' || !parsedUrl.pathname.endsWith('/invoke.js') || parsedUrl.username || parsedUrl.password) {
      throw new BadRequestException('Adsterra placements require a secure HTTPS invoke.js URL');
    }
    if (!containerId || !/^container-[a-z0-9_-]+$/i.test(containerId)) {
      throw new BadRequestException('Adsterra Native Banner placements require a container ID beginning with "container-"');
    }
  }

  private validateCustomImageUrls(network?: string, imageUrl?: string | null, targetUrl?: string | null, status = 'ACTIVE') {
    if (network !== 'CUSTOM_IMAGE') return;
    if (status === 'ACTIVE' && (!this.isHttpUrl(imageUrl) || !this.isHttpUrl(targetUrl))) {
      throw new BadRequestException('Active custom image placements require an image and destination HTTP(S) URL');
    }
    for (const value of [imageUrl, targetUrl]) {
      if (!value?.trim()) continue;
      let url: URL;
      try {
        url = new URL(value);
      } catch {
        throw new BadRequestException('Custom image and destination URLs must be absolute HTTP(S) URLs');
      }
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
        throw new BadRequestException('Custom image and destination URLs must be absolute HTTP(S) URLs');
      }
    }
  }

  private isHttpUrl(value?: string | null) {
    if (!value) return false;
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password;
    } catch {
      return false;
    }
  }

  private isValidAdsterraPlacement(placement: any) {
    if (placement.format !== 'IN_FEED' || !/^container-[a-z0-9_-]+$/i.test(placement.clientOrPublisherId || '')) return false;
    try {
      const url = new URL(placement.slotId || '');
      return url.protocol === 'https:' && url.pathname.endsWith('/invoke.js') && !url.username && !url.password;
    } catch {
      return false;
    }
  }

  /**
   * 10. Admin: Delete placement
   */
  async deletePlacement(id: string) {
    const placement = await this.prisma.adPlacement.findUnique({ where: { id } });
    if (!placement) throw new NotFoundException(`Placement with ID ${id} not found`);

    await this.prisma.adPlacement.delete({ where: { id } });
    return { success: true, message: 'Placement deleted successfully' };
  }

  /**
   * 11. Admin: Get all raw global ads settings
   */
  async getAdminGlobalConfig() {
    const settings = await this.prisma.systemSetting.findMany({
      where: { key: { startsWith: 'ads_' } },
    });

    const res: Record<string, any> = {
      ads_global_enabled: false,
      ads_google_adsense_enabled: false,
      ads_google_adsense_client_id: '',
      ads_carbon_enabled: false,
      ads_carbon_serve_id: '',
      ads_carbon_placement: '',
      ads_ethical_ads_enabled: false,
      ads_ethical_ads_publisher_id: '',
      ads_adsterra_enabled: false,
      ads_hide_for_logged_in: false,
      ads_interstitial_enabled: false,
      ads_interstitial_timer_seconds: 5,
      ads_interstitial_frequency_minutes: 10,
      ads_interstitial_network: 'CUSTOM_HTML',
      ads_interstitial_custom_html: '',
      ads_interstitial_custom_image: '',
      ads_interstitial_custom_url: '',
      ads_interstitial_title: 'Sponsored Architecture Briefing',
    };

    settings.forEach((s) => {
      if (s.key === 'ads_google_adsense_auto_ads') return;
      if (s.key.endsWith('_enabled') || s.key.endsWith('_logged_in')) {
        res[s.key] = s.value === 'true';
      } else {
        res[s.key] = s.value;
      }
    });

    return res;
  }

  /**
   * 12. Admin: Update global ads settings
   */
  async updateAdminGlobalConfig(dto: UpdateGlobalAdsConfigDto) {
    const nextConfig = { ...(await this.getAdminGlobalConfig()), ...dto };
    if (nextConfig.ads_google_adsense_enabled && !/^ca-pub-\d{16}$/.test(nextConfig.ads_google_adsense_client_id || '')) {
      throw new BadRequestException('Enter a valid AdSense publisher ID before enabling Google AdSense');
    }
    if (nextConfig.ads_carbon_enabled && (!nextConfig.ads_carbon_serve_id?.trim() || !nextConfig.ads_carbon_placement?.trim())) {
      throw new BadRequestException('Enter both Carbon Ads IDs before enabling Carbon Ads');
    }
    if (nextConfig.ads_ethical_ads_enabled && !nextConfig.ads_ethical_ads_publisher_id?.trim()) {
      throw new BadRequestException('Enter an EthicalAds publisher ID before enabling EthicalAds');
    }
    if (
      nextConfig.ads_interstitial_enabled &&
      nextConfig.ads_interstitial_network === 'CUSTOM_HTML' &&
      !nextConfig.ads_interstitial_custom_html?.trim()
    ) {
      throw new BadRequestException('Add an interstitial embed before enabling the custom HTML interstitial');
    }
    this.validateCustomImageUrls(
      nextConfig.ads_interstitial_network,
      nextConfig.ads_interstitial_custom_image,
      nextConfig.ads_interstitial_custom_url,
      nextConfig.ads_interstitial_enabled ? 'ACTIVE' : 'PAUSED',
    );
    const updates: Promise<any>[] = [];

    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) {
        const stringValue = typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value);
        updates.push(
          this.prisma.systemSetting.upsert({
            where: { key },
            create: { key, value: stringValue, description: `Global ads config for ${key}` },
            update: { value: stringValue },
          })
        );
      }
    }

    await Promise.all(updates);
    return this.getAdminGlobalConfig();
  }

  /**
   * 13. Admin: Update ads.txt content
   */
  async updateAdsTxtContent(dto: UpdateAdsTxtDto) {
    await this.prisma.systemSetting.upsert({
      where: { key: 'ads_txt_content' },
      create: {
        key: 'ads_txt_content',
        value: dto.ads_txt_content,
        description: 'Dynamic ads.txt file verification content',
      },
      update: { value: dto.ads_txt_content },
    });

    return { success: true, message: 'ads.txt updated successfully' };
  }
}
