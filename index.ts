_import * as codec from "./codec";
import * as ecc from "./ecc";

/**
 * The main Hepta module, which combines the codec and ECC functionalities.
 */

export const Hepta = {
  ...codec,
  ...ecc,
};
