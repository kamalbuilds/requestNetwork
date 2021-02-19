/* eslint-disable spellcheck/spell-checker */
import * as AJV from 'ajv';
import * as jsonSchema from 'ajv/lib/refs/json-schema-draft-06.json';
import * as schemaAddress from './format/address.json';
import formats from './format';

export default {
  /**
   * validation of data
   * @param   data    object you want to validate
   * @return  object.valid == true if the json is valid, object.valid == false and object.errors otherwise.
   */
  validate(data: any): any {
    const validationTool = new AJV().addMetaSchema(jsonSchema).addSchema(schemaAddress);

    // Check the meta information
    if (!data.meta) {
      return { valid: false, errors: [{ message: 'meta not found' }] };
    }
    if (!data.meta.format) {
      return { valid: false, errors: [{ message: 'meta.format not found' }] };
    }
    if (!data.meta.version) {
      return { valid: false, errors: [{ message: 'meta.version not found' }] };
    }

    // Try to retrieve the schema json
    const schema = formats[data.meta.format]?.[data.meta.version];
    if (!schema) {
      return { valid: false, errors: [{ message: 'format not found' }] };
    }

    // Compile and Validate
    const validate = validationTool.compile(schema);
    const valid = validate(data);

    // If not valid return the error
    if (!valid) {
      return { valid: false, errors: validate.errors };
    }

    return { valid: true };
  },
  /**
   * Check if the object format is known
   * @param data the object to check
   * @return true if the object format is known
   */
  isKnownFormat(data: any): boolean {
    return !!data.meta && data.meta.format === 'rnf_invoice';
  },
};
