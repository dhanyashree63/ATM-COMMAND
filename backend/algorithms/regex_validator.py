"""
BCS503 - Automata Theory and Computability
Module: Regular Expression Validator and DFA-Regex Cross-Verification

Validates ATM ID and Error Code using standard Regular Expressions and performs
rigorous cross-comparison between the Automaton (DFA) result and Regular Expression result.
"""

import re
from typing import Dict, Any, Tuple
from .dfa_validator import DFAATMValidator, DFAErrorCodeValidator


# Regular expression definitions
ATM_ID_PATTERN = re.compile(r"^ATM([A-Z]{3})([0-9]{4})$")
ERROR_CODE_PATTERN = re.compile(r"^E([0-9]{2})([A-Z])$")


def validate_atm_id_regex(atm_id: str) -> Tuple[bool, Dict[str, Any], str]:
    """
    Validates ATM ID using regular expressions.
    Format: ATM[A-Z]{3}[0-9]{4}
    Returns: (is_valid, parsed_groups, message)
    """
    if not atm_id or not isinstance(atm_id, str):
        return False, {}, "ATM ID is required and must be a string."

    match = ATM_ID_PATTERN.match(atm_id)
    if match:
        region_prefix = match.group(1)
        terminal_number = match.group(2)
        return True, {
            "full_id": atm_id,
            "prefix": "ATM",
            "region_code": region_prefix,
            "terminal_number": terminal_number
        }, f"ATM ID matches pattern ^ATM[A-Z]{{3}}[0-9]{{4}}$ (Region: {region_prefix}, Terminal: {terminal_number})."
    else:
        return False, {}, "ATM ID does not conform to regex pattern ^ATM[A-Z]{3}[0-9]{4}$."


def validate_error_code_regex(code: str) -> Tuple[bool, Dict[str, Any], str]:
    """
    Validates Error Code using regular expressions.
    Format: E[0-9]{2}[A-Z]
    Returns: (is_valid, parsed_groups, message)
    """
    if not code or not isinstance(code, str):
        return False, {}, "Error code is required and must be a string."

    match = ERROR_CODE_PATTERN.match(code)
    if match:
        code_number = match.group(1)
        sub_type = match.group(2)
        return True, {
            "full_code": code,
            "prefix": "E",
            "code_number": code_number,
            "sub_type": sub_type
        }, f"Error Code matches pattern ^E[0-9]{{2}}[A-Z]$ (Subsystem: {code_number}, Variant: {sub_type})."
    else:
        return False, {}, "Error code does not conform to regex pattern ^E[0-9]{2}[A-Z]$."


def verify_and_compare_identifiers(atm_id: str, error_code: str) -> Dict[str, Any]:
    """
    Performs dual validation (DFA + Regex) for both ATM ID and Error Code,
    then compares the results to ensure formal equivalence between the Language
    accepted by DFA M and the Language denoted by Regular Expression R (L(M) == L(R)).
    """
    # 1. ATM ID validation
    atm_dfa_valid, atm_dfa_trace, atm_dfa_msg = DFAATMValidator.validate(atm_id)
    atm_regex_valid, atm_regex_groups, atm_regex_msg = validate_atm_id_regex(atm_id)
    atm_agreement = (atm_dfa_valid == atm_regex_valid)

    # 2. Error Code validation
    err_dfa_valid, err_dfa_trace, err_dfa_msg = DFAErrorCodeValidator.validate(error_code)
    err_regex_valid, err_regex_groups, err_regex_msg = validate_error_code_regex(error_code)
    err_agreement = (err_dfa_valid == err_regex_valid)

    # Overall validity
    is_valid = atm_dfa_valid and atm_regex_valid and err_dfa_valid and err_regex_valid

    # Discrepancy detection
    discrepancy = None
    if not atm_agreement:
        discrepancy = f"Discrepancy in ATM ID validation! DFA result: {atm_dfa_valid}, Regex result: {atm_regex_valid}."
    elif not err_agreement:
        discrepancy = f"Discrepancy in Error Code validation! DFA result: {err_dfa_valid}, Regex result: {err_regex_valid}."

    return {
        "is_valid": is_valid,
        "atm_id": {
            "value": atm_id,
            "dfa_valid": atm_dfa_valid,
            "regex_valid": atm_regex_valid,
            "agreed": atm_agreement,
            "dfa_trace": atm_dfa_trace,
            "dfa_message": atm_dfa_msg,
            "regex_message": atm_regex_msg,
            "parsed": atm_regex_groups
        },
        "error_code": {
            "value": error_code,
            "dfa_valid": err_dfa_valid,
            "regex_valid": err_regex_valid,
            "agreed": err_agreement,
            "dfa_trace": err_dfa_trace,
            "dfa_message": err_dfa_msg,
            "regex_message": err_regex_msg,
            "parsed": err_regex_groups
        },
        "discrepancy": discrepancy,
        "summary": "Validation successful: DFA and Regular Expression agree." if is_valid else (
            discrepancy or (atm_dfa_msg if not atm_dfa_valid else err_dfa_msg)
        )
    }
