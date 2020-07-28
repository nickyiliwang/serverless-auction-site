const schema = {
  properties: {
    body: {
      type: "string",
      minLength: 1,
      // ending with equal sign, a base64 thing
      pattern: '\=$',
    },
  },
  required: ["body"],
};

export default schema;
