import { Injectable, Logger, OnModuleInit, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdPlacementDto, AdNetworkDto, AdFormatDto, AdStatusDto } from './dto/create-ad-placement.dto';
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
          status: 'ACTIVE',
          format: 'RESPONSIVE',
          slotId: '1092837466',
          order: 1,
        },
        {
          name: 'Article Top Leaderboard',
          slug: 'article-header',
          network: 'GOOGLE_ADSENSE',
          status: 'ACTIVE',
          format: 'RESPONSIVE',
          slotId: '1092837465',
          order: 2,
        },
        {
          name: 'Article Sticky Sidebar',
          slug: 'article-sidebar',
          network: 'CARBON_ADS',
          status: 'ACTIVE',
          format: 'RECTANGLE_300x250',
          order: 3,
        },
        {
          name: 'In-Article Native Break',
          slug: 'article-in-content-1',
          network: 'GOOGLE_ADSENSE',
          status: 'ACTIVE',
          format: 'IN_ARTICLE',
          slotId: '5647382910',
          order: 4,
        },
        {
          name: 'Home Mid-Feed Sponsor Banner',
          slug: 'home-mid-feed',
          network: 'CUSTOM_IMAGE',
          status: 'ACTIVE',
          format: 'BANNER_728x90',
          customImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=728&h=90&fit=crop&q=80',
          customUrl: 'https://nexusnation.in',
          customAlt: 'Explore Next-Gen Distributed Architecture',
          order: 5,
        },
        {
          name: 'Global Footer Sponsor Banner',
          slug: 'footer-banner',
          network: 'CUSTOM_IMAGE',
          status: 'ACTIVE',
          format: 'BANNER_728x90',
          customImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=728&h=90&fit=crop&q=80',
          customUrl: 'https://nexusnation.in',
          customAlt: 'Build High-Scale Distributed Systems with NexusNation',
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
        }
      }

      // 2. Seed default system settings for ad control
      const defaultSettings: Record<string, string> = {
        ads_global_enabled: 'true',
        ads_google_adsense_enabled: 'true',
        ads_google_adsense_client_id: 'ca-pub-9847291823746501',
        ads_google_adsense_auto_ads: 'false',
        ads_carbon_enabled: 'false',
        ads_carbon_serve_id: 'CEBD42Q',
        ads_carbon_placement: 'nexusnationin',
        ads_ethical_ads_enabled: 'false',
        ads_ethical_ads_publisher_id: 'nexus-developer-blog',
        ads_adsterra_enabled: 'false',
        ads_hide_for_logged_in: 'false',
        ads_interstitial_enabled: 'false',
        ads_interstitial_timer_seconds: '5',
        ads_interstitial_frequency_minutes: '10',
        ads_interstitial_network: 'CUSTOM_HTML',
        ads_interstitial_custom_html: '<script async="async" data-cfasync="false" src="https://bendspecimen.com/bd678b45243cf1ba0c91ec1cfad866d2/invoke.js"></script>\n<div id="container-bd678b45243cf1ba0c91ec1cfad866d2"></div>',
        ads_interstitial_custom_image: '',
        ads_interstitial_custom_url: '',
        ads_interstitial_title: 'Sponsored Architecture Briefing',
        ads_txt_content: `# NexusNation Ads.txt Verification File
google.com, pub-9847291823746501, DIRECT, f08c47fec0942fa0
buysellads.com, pub-19283746, DIRECT, 840fec729a1b4
`,
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
        enabled: configMap['ads_google_adsense_enabled'] === 'true',
        clientId: configMap['ads_google_adsense_client_id'] || '',
        autoAds: configMap['ads_google_adsense_auto_ads'] === 'true',
      },
      carbon: {
        enabled: configMap['ads_carbon_enabled'] === 'true',
        serveId: configMap['ads_carbon_serve_id'] || '',
        placement: configMap['ads_carbon_placement'] || '',
      },
      ethicalAds: {
        enabled: configMap['ads_ethical_ads_enabled'] === 'true',
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
      if (!path?.startsWith('/') || path.startsWith('//')) return true;
      return !(placement.excludePaths || []).some((excludedPath) => {
        const excluded = excludedPath.replace(/\/+$/, '') || '/';
        return path === excluded || (excluded !== '/' && path.startsWith(`${excluded}/`));
      });
    });

    // EthicalAds requires one unit and no competing third-party ads on a page.
    const ethicalPlacement = placements.find((placement) => placement.network === 'ETHICAL_ADS');
    return ethicalPlacement ? [ethicalPlacement] : placements;
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

    return (
      setting?.value ||
      `# NexusNation Ads.txt\ngoogle.com, pub-9847291823746501, DIRECT, f08c47fec0942fa0\n`
    );
  }

  /**
   * 5. Track impression non-blocking
   */
  async trackImpression(dto: TrackAdEventDto) {
    try {
      const placement = await this.prisma.adPlacement.findUnique({
        where: { slug: dto.placementSlug },
        select: { id: true },
      });

      if (!placement) return { success: true };

      await Promise.all([
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
    } catch {
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
        select: { id: true },
      });

      if (!placement) return { success: true };

      await Promise.all([
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
    } catch {
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
      const ctr =
        p.impressionsCount > 0
          ? Number(((p.clicksCount / p.impressionsCount) * 100).toFixed(2))
          : 0;

      return {
        ...p,
        ctr,
      };
    });
  }

  /**
   * 8. Admin: Create new placement
   */
  async createPlacement(dto: CreateAdPlacementDto) {
    this.validateAdsterraPlacement(dto.network, dto.format, dto.slotId, dto.clientOrPublisherId);
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

    this.validateAdsterraPlacement(
      dto.network || placement.network,
      dto.format || placement.format,
      dto.slotId === undefined ? placement.slotId : dto.slotId,
      dto.clientOrPublisherId === undefined ? placement.clientOrPublisherId : dto.clientOrPublisherId,
    );

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
      ads_global_enabled: true,
      ads_google_adsense_enabled: true,
      ads_google_adsense_client_id: '',
      ads_google_adsense_auto_ads: false,
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
      ads_interstitial_custom_html: '<script async="async" data-cfasync="false" src="https://bendspecimen.com/bd678b45243cf1ba0c91ec1cfad866d2/invoke.js"></script>\n<div id="container-bd678b45243cf1ba0c91ec1cfad866d2"></div>',
      ads_interstitial_custom_image: '',
      ads_interstitial_custom_url: '',
      ads_interstitial_title: 'Sponsored Architecture Briefing',
    };

    settings.forEach((s) => {
      if (s.key.endsWith('_enabled') || s.key.endsWith('_auto_ads') || s.key.endsWith('_logged_in')) {
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
