export const throttle = (func: Function, timeout = 250) => {
  let timer: number;

  return (...args) => {
    const deferred = () => {
      timer = null;
      func(...args);
    };

    if (!timer) timer = setTimeout(deferred, timeout);
  };
};

export const debounce = (func: Function, timeout = 250) => {
  let timer: number;

  return (...args) => {
    const deferred = () => {
      timer = null;
      func(...args);
    };

    timer && clearTimeout(timer);
    timer = setTimeout(deferred, timeout);
  };
};
