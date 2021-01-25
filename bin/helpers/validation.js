'use strict';

class ValidationContract {
  constructor() {
    this._errors = [];
  }

  isNotArrayOrEmpty(value, message) {
    if (!value && value.length === 0) {
      this._errors.push({ message });
    }
  }

  isTrue(value, message) {
    if (value) {
      this._errors.push({ message });
    }
  }

  isRequired(value, message) {
    if (!value || value.lenght <= 0) {
      this._errors.push({ message });
    }
  }

  isEmail(value, message) {
    const regexEmail = new RegExp(
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    );
    if (value && !regexEmail.test(value)) {
      this._errors.push({ message });
    }
  }

  errors() {
    return this._errors;
  }

  isValid() {
    return this._errors.length === 0;
  }
}

module.exports = ValidationContract;
