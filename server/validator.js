const { z } = require("zod");

function formValidator(props) {
  const zodProps = z.object(props);

  function validate(name, data) {
    return zodProps.shape[name].safeParse(data);
  }

  function validateAll(data) {
    let error = [],
      isInvalid = false;
    for (let name in data) {
      const result = validate(name, data[name]);
      if (!result.success) {
        isInvalid = true;
        error.push(name);
        continue;
      }
    }

    return { isInvalid, error };
  }

  return { validate, validateAll };
}

function validatorMiddleware(validator) {
  return (req, res, next) => {
    console.log(req.body);
    const { isInvalid, error } = validator.validateAll(req.body);
    if (isInvalid) {
      return res.status(400).json({ status: 400, error });
    }
    next();
  };
}

module.exports = {
  formValidator,
  validatorMiddleware,
};
