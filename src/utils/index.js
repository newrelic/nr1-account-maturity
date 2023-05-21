export const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

const async = require('async');

export const genericQueue = (concurrency) => {
  return new Promise((resolve) => {
    const q = async.queue((task, callback) => {
      console.log('hello ' + task.name);
      callback();
    }, concurrency || 5);

    // assign a callback
    q.drain(() => {
      console.log('all items have been processed');
      resolve('done');
    });
  });
};
