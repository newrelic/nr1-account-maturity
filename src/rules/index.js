import APM from './APM';
import BROWSER from './BROWSER';
import SYNTHETICS from './SYNTHETICS';
import INFRASTRUCTURE from './INFRASTRUCTURE';
import KUBERNETES from './KUBERNETES';
import LOG from './LOG';
import EXTENSIBILITY from './EXTENSIBILITY';
import MOBILE from './MOBILE';
import WORKLOADS from './WORKLOADS';
import SLM from './SLM';
import NPM from './NPM';

export default {
  // category name : category rules
  APM: APM,
  Browser: BROWSER,
  Synthetics: SYNTHETICS,
  Infrastructure: INFRASTRUCTURE,
  Kubernetes: KUBERNETES,
  Logs: LOG,
  Extensibility: EXTENSIBILITY,
  Mobile: MOBILE,
  Workloads: WORKLOADS,
  SLM: SLM,
  NPM: NPM,
};
