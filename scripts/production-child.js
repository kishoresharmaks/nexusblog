function monitorChildProcess(child, name, onFailure, isStopping) {
  let reported = false;
  const fail = (error) => {
    if (reported || isStopping()) return;
    reported = true;
    onFailure(name, error);
  };

  child.once('error', fail);
  child.once('close', (code, signal) => {
    fail(new Error(`${name} process exited (code=${code}, signal=${signal || 'none'})`));
  });
}

module.exports = { monitorChildProcess };
