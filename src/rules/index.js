import APM from './APM';
import BROWSER from './BROWSER';
import SYNTHETICS from './SYNTHETICS';
import INFRASTRUCTURE from './INFRASTRUCTURE';
import KUBERNETES from './KUBERNETES';

export default {
  // category name : category rules
  APM: APM,
  Browser: BROWSER,
  Synthetics: SYNTHETICS,
  Infrastructure: INFRASTRUCTURE,
  Kubernetes: KUBERNETES,
};
