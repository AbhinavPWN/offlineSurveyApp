import { MemberFormState } from "../models/MemberFormState";

export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof MemberFormState, string>>;
}

export function validateBasicInfo(form: MemberFormState): ValidationResult {
  const errors: Partial<Record<keyof MemberFormState, string>> = {};

  const trimmedName = form.fName?.trim() ?? "";

  // Enroll Date
  if (!form.enrollDate) {
    errors.enrollDate = "Enroll date is required.";
  }

  // Full Name
  if (!trimmedName) {
    errors.fName = "Full name is required.";
  }

  // Gender
  if (!form.gender) {
    errors.gender = "Gender is required.";
  }

  // Mobile (Nepali format: starts with 9 and 10 digits)
  if (!form.mobileNo) {
    errors.mobileNo = "Mobile number is required.";
  } else if (!/^[9]\d{9}$/.test(form.mobileNo)) {
    errors.mobileNo = "Enter valid 10-digit mobile number.";
  }

  // Marital Status
  if (!form.maritalStatus) {
    errors.maritalStatus = "Marital status is required.";
  }

  // Relation
  if (!form.relationtoHH) {
    errors.relationtoHH = "Relation to household is required.";
  }

  // DOB
  // if (!form.dob) {
  //   errors.dob = "Date of birth is required.";
  // }

  // Logical Rule: Enroll Date >= DOB
  if (form.enrollDate && form.dob) {
    if (form.enrollDate < form.dob) {
      errors.enrollDate = "Enroll date cannot be before date of birth.";
    }
  }

  // Client Age (required)
  if (!form.clientAge) {
    errors.clientAge = "Age is required.";
  } else {
    const age = Number(form.clientAge);

    if (isNaN(age) || age < 0 || age > 120) {
      errors.clientAge = "Enter valid age.";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateIdentityInfo(form: MemberFormState): ValidationResult {
  const errors: Partial<Record<keyof MemberFormState, string>> = {};

  const isMinor = form.minorYn;

  const hasAnyIdentityValue =
    !!form.idDocumentNo?.trim() ||
    !!form.idIssueDistrictCode ||
    !!form.memIdIssueDate;

  // Adult → Required
  if (!isMinor) {
    if (!form.idDocumentNo?.trim()) {
      errors.idDocumentNo = "Citizenship number is required.";
    }

    if (!form.idIssueDistrictCode) {
      errors.idIssueDistrictCode = "Issue district is required.";
    }

    if (!form.memIdIssueDate) {
      errors.memIdIssueDate = "Issue date is required.";
    }
  }

  // If minor but user entered something → validate consistency
  if (isMinor && hasAnyIdentityValue) {
    if (!form.idDocumentNo?.trim()) {
      errors.idDocumentNo = "Citizenship number cannot be empty.";
    }
    if (!form.idIssueDistrictCode) {
      errors.idIssueDistrictCode = "Issue district required.";
    }
    if (!form.memIdIssueDate) {
      errors.memIdIssueDate = "Issue date required.";
    }
  }

  // Date Logical Rules
  if (form.memIdIssueDate && form.dob) {
    if (form.memIdIssueDate < form.dob) {
      errors.memIdIssueDate = "Issue date cannot be before date of birth.";
    }
  }

  if (form.memIdIssueDate && form.enrollDate) {
    if (form.memIdIssueDate > form.enrollDate) {
      errors.memIdIssueDate = "Issue date cannot be after enroll date.";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateAddressInfo(form: MemberFormState): ValidationResult {
  const errors: Partial<Record<keyof MemberFormState, string>> = {};

  if (!form.address1Type) {
    errors.address1Type = "Address type is required.";
  }

  if (!form.address1Province) errors.address1Province = "Province is required";

  if (!form.address1DistrictCode) {
    errors.address1DistrictCode = "District is required.";
  }

  if (!form.address1Line2) {
    errors.address1Line2 = "Municipality is required.";
  }

  if (!form.address1Line3) {
    errors.address1Line3 = "Ward number is required.";
  } else {
    const ward = Number(form.address1Line3);
    if (ward < 1 || ward > 32) {
      errors.address1Line3 = "Ward must be between 1 and 32.";
    }
  }

  if (!form.address?.trim()) {
    errors.address = "Tole / Street is required.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateOccupationInfo(
  form: MemberFormState,
): ValidationResult {
  const errors: Partial<Record<keyof MemberFormState, string>> = {};

  if (!form.casteCode) {
    errors.casteCode = "Caste is required.";
  }

  if (!form.religionCode) {
    errors.religionCode = "Religion is required.";
  }

  if (!form.occupationCode) {
    errors.occupationCode = "Occupation is required.";
  }

  if (!form.educationCode) {
    errors.educationCode = "Education is required.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateFinancialInfo(form: MemberFormState): ValidationResult {
  const errors: Partial<Record<keyof MemberFormState, string>> = {};

  if (!form.totalAsset || form.totalAsset < 0) {
    errors.totalAsset = "Total asset is required.";
  }

  if (!form.totalLiabilities || form.totalLiabilities < 0) {
    errors.totalLiabilities = "Total liabilities is required.";
  }

  const hasIncome =
    form.soiSalary ||
    form.soiBusIncome ||
    form.soiAgriculture ||
    form.soiReturnfrmInvest ||
    form.soiInheritance ||
    form.soiRemittance ||
    form.soiOthers;

  if (!hasIncome) {
    errors.soiSalary = "At least one income source must be selected.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
