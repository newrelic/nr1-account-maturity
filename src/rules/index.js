import APM from './APM';
import BROWSER from './BROWSER';
import SYNTHETICS from './SYNTHETICS';
import INFRASTRUCTURE from './INFRASTRUCTURE';
import KUBERNETES from './KUBERNETES';
import LOG from './LOG';
// import EXTENSIBILITY from './EXTENSIBILITY';
import MOBILE from './MOBILE';
import WORKLOADS from './WORKLOADS';
import SLM from './SLM';
// import NPM from './NPM';

export default {
  // category name : category rules
  APM: APM,
  Browser: BROWSER,
  Synthetics: SYNTHETICS,
  Infrastructure: INFRASTRUCTURE,
  Kubernetes: KUBERNETES,
  Logs: LOG,
  // Extensibility: EXTENSIBILITY,
  Mobile: MOBILE,
  Workloads: WORKLOADS,
  SLM: SLM,
  // NPM: NPM,
};

// colors provided by @etantry
export const productColors = {
  APM: '#44CC29',
  Browser: '#49AAAE',
  Synthetics: '#B252A4',
  Infrastructure: '#971A4E',
  Kubernetes: '#D48E06',
  Logs: '#6827A4',
  Extensibility: '#6BB2FC',
  Mobile: '#F82241',
  Workloads: '#4831EC',
  SLM: '#D25028',
  // NPM: '#F38A8A',
};
