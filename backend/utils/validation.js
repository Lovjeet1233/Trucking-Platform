 
  // utils/validation.js
  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} - Whether email is valid
   */
  exports.isValidEmail = (email) => {
    const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
  };
  
  /**
   * Validate phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} - Whether phone number is valid
   */
  exports.isValidPhone = (phone) => {
    // Basic validation, can be enhanced for specific country formats
    const re = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return re.test(phone);
  };
  
  /**
   * Validate a date is in the future
   * @param {Date} date - Date to validate
   * @returns {boolean} - Whether date is in the future
   */
  exports.isFutureDate = (date) => {
    return new Date(date) > new Date();
  };
  
  /**
   * Validate a driver's license has been held for at least X years
   * @param {Date} issueDate - Date the license was issued
   * @param {number} years - Minimum years required
   * @returns {boolean} - Whether license meets the requirement
   */
  exports.hasLicenseYears = (issueDate, years = 5) => {
    const now = new Date();
    const minDate = new Date();
    minDate.setFullYear(now.getFullYear() - years);
    
    return new Date(issueDate) <= minDate;
  };
  
  /**
   * Validate a truck's age is not more than X years
   * @param {number} manufactureYear - Year the truck was manufactured
   * @param {number} maxAge - Maximum age allowed in years
   * @returns {boolean} - Whether truck meets the requirement
   */
  exports.isTruckValid = (manufactureYear, maxAge = 5) => {
    const currentYear = new Date().getFullYear();
    return currentYear - manufactureYear <= maxAge;
  };