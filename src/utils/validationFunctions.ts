const validationFunctions = {
  isRequired: function (value: string) {
    return value.trim() ? '' : 'This field is required';
  },
  checkLength: function (value: string, args: string[] | number[]) {
    const [min, max] = args as number[];
    return (value.trim().length >= min && value.trim().length <= max) || !value.trim().length
      ? ''
      : `Input must be minimum ${min} and maximum ${max} characters in length`;
  },
  noSpaces: function (value: string) {
    return !value.includes(' ') ? '' : `Input must not contain spaces`;
  },
  isUsername: function (value: string) {
    return /^[a-zA-Z0-9_.]+$/.test(value)
      ? ''
      : `Only alphanumeric characters {A-Z, a-z, 0-9}, underscore {_}, and period {.} are allowed`;
  },
  isEmail: function (value: string) {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
      ? ''
      : 'Enter a valid email address';
  },
  isPassword: function (value: string) {
    let hasNumeric = false;
    let hasUppercase = false;
    let hasLowercase = false;
    let hasSpecial = false;
    let hasInvalidChar = false;
    const invalidChars: string[] = [];
    const numericCharacters = [48, 57]; // 0-9
    const uppercaseCharacters = [65, 90]; // A-Z
    const lowercaseCharacters = [97, 122]; // a-z
    const specialCharacters = [
      [33, 33], // !
      [35, 36], // #$
      [38, 38], // &
      [40, 43], // ()*+
      [45, 46], // _.
      [61, 61], // =
      [63, 64], // ?@
      [91, 91], // [
      [93, 96], // ]^_`
      [126, 126], // ~
    ];

    value.split('').forEach((char) => {
      let isNumeric = false;
      let isUppercase = false;
      let isLowercase = false;
      let isSpecial = false;
      const charCode = char.charCodeAt(0);

      if (charCode >= numericCharacters[0] && charCode <= numericCharacters[1]) {
        hasNumeric = true;
        isNumeric = true;
      }

      if (charCode >= uppercaseCharacters[0] && charCode <= uppercaseCharacters[1]) {
        hasUppercase = true;
        isUppercase = true;
      }

      if (charCode >= lowercaseCharacters[0] && charCode <= lowercaseCharacters[1]) {
        hasLowercase = true;
        isLowercase = true;
      }

      specialCharacters.forEach((chars) => {
        if (charCode >= chars[0] && charCode <= chars[1]) {
          hasSpecial = true;
          isSpecial = true;
        }
      });

      if (!isNumeric && !isUppercase && !isLowercase && !isSpecial) {
        hasInvalidChar = true;
        invalidChars.push(char);
      }
    });

    if (hasInvalidChar) {
      return `Password has invalid character${invalidChars.length ? 's' : ''}: ${invalidChars.join(
        ' ',
      )}`;
    }

    if (!hasNumeric || !hasUppercase || !hasLowercase || !hasSpecial) {
      return 'Password must contain at least one uppercase letter {A-Z}, at least one lowercase letter {a-z}, at least one digit {0-9}, and at least one special character from !#$&()*+_.=?@[]^_`~';
    }

    return '';
  },
  isSameAsPassword: function (value: string, args: string[] | number[]) {
    const [password] = args;
    return value === password ? '' : 'Passwords do not match';
  },
};

export default validationFunctions;
