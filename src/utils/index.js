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
