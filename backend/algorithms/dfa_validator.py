"""
BCS503 - Automata Theory and Computability
Module: DFA Validator for ATM Error Logger and Dispatcher

Implements formal Deterministic Finite Automata (DFA) for:
1. ATM ID validation (Format: ATM[A-Z]{3}[0-9]{4}, e.g. ATMABC1234)
2. Error Code validation (Format: E[0-9]{2}[A-Z], e.g. E01A)

Formal Definition:
M = (Q, Sigma, delta, q0, F)
- Q: Finite set of states
- Sigma: Input alphabet
- delta: Transition function Q x Sigma -> Q
- q0: Initial state
- F: Set of accepting (final) states
"""

from typing import Dict, List, Tuple, Any


class DFAATMValidator:
    """
    Formal DFA for ATM ID:
    Q = {q0, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q_trap}
    Sigma = {A-Z, 0-9}
    q0 = q0
    F = {q10}
    Length must be exactly 10 characters.
    """

    STATES = [
        "q0", "q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10", "q_trap"
    ]
    INITIAL_STATE = "q0"
    ACCEPTING_STATES = {"q10"}

    STATE_DESCRIPTIONS = {
        "q0": "Start state: Expecting prefix 'A'",
        "q1": "Matched 'A': Expecting prefix 'T'",
        "q2": "Matched 'AT': Expecting prefix 'M'",
        "q3": "Matched 'ATM': Expecting 1st region/branch letter [A-Z]",
        "q4": "Matched 1st letter: Expecting 2nd region/branch letter [A-Z]",
        "q5": "Matched 2nd letter: Expecting 3rd region/branch letter [A-Z]",
        "q6": "Matched 3 letters: Expecting 1st terminal digit [0-9]",
        "q7": "Matched 1st digit: Expecting 2nd terminal digit [0-9]",
        "q8": "Matched 2nd digit: Expecting 3rd terminal digit [0-9]",
        "q9": "Matched 3rd digit: Expecting 4th terminal digit [0-9]",
        "q10": "Accept state: Valid 10-character ATM ID reached",
        "q_trap": "Trap state: Invalid character or incorrect length"
    }

    @classmethod
    def transition(cls, current_state: str, char: str) -> str:
        """Delta transition function: delta(state, char) -> next_state"""
        if current_state == "q_trap":
            return "q_trap"

        # Prefix transitions: 'A', 'T', 'M'
        if current_state == "q0":
            return "q1" if char == 'A' else "q_trap"
        elif current_state == "q1":
            return "q2" if char == 'T' else "q_trap"
        elif current_state == "q2":
            return "q3" if char == 'M' else "q_trap"

        # 3 Alphabetic characters [A-Z]
        elif current_state == "q3":
            return "q4" if char.isupper() and char.isalpha() else "q_trap"
        elif current_state == "q4":
            return "q5" if char.isupper() and char.isalpha() else "q_trap"
        elif current_state == "q5":
            return "q6" if char.isupper() and char.isalpha() else "q_trap"

        # 4 Digits [0-9]
        elif current_state == "q6":
            return "q7" if char.isdigit() else "q_trap"
        elif current_state == "q7":
            return "q8" if char.isdigit() else "q_trap"
        elif current_state == "q8":
            return "q9" if char.isdigit() else "q_trap"
        elif current_state == "q9":
            return "q10" if char.isdigit() else "q_trap"

        # Any character after q10 causes length overflow to trap state
        elif current_state == "q10":
            return "q_trap"

        return "q_trap"

    @classmethod
    def validate(cls, atm_id: str) -> Tuple[bool, List[Dict[str, Any]], str]:
        """
        Validates ATM ID via DFA execution and generates an execution trace.
        Returns: (is_valid, trace, explanation)
        """
        if not atm_id or not isinstance(atm_id, str):
            return False, [], "ATM ID cannot be empty or non-string."

        current_state = cls.INITIAL_STATE
        trace: List[Dict[str, Any]] = [
            {
                "step": 0,
                "input_char": "",
                "from_state": cls.INITIAL_STATE,
                "to_state": cls.INITIAL_STATE,
                "description": cls.STATE_DESCRIPTIONS[cls.INITIAL_STATE],
                "is_accepting": False
            }
        ]

        for i, char in enumerate(atm_id):
            prev_state = current_state
            current_state = cls.transition(current_state, char)
            trace.append({
                "step": i + 1,
                "input_char": char,
                "from_state": prev_state,
                "to_state": current_state,
                "description": cls.STATE_DESCRIPTIONS.get(current_state, "Unknown state"),
                "is_accepting": current_state in cls.ACCEPTING_STATES
            })
            if current_state == "q_trap":
                break

        is_valid = (current_state in cls.ACCEPTING_STATES) and (len(atm_id) == 10)

        if is_valid:
            message = f"Valid ATM ID '{atm_id}'. Successfully accepted by DFA in state q10."
        else:
            if len(atm_id) < 10:
                message = f"Incomplete ATM ID: length is {len(atm_id)}, expected exactly 10 characters (ATM + 3 letters + 4 digits)."
            elif len(atm_id) > 10:
                message = f"ATM ID length exceeded: length is {len(atm_id)}, expected exactly 10 characters."
            else:
                message = f"DFA transitioned to trap state 'q_trap' due to invalid format."

        return is_valid, trace, message


class DFAErrorCodeValidator:
    """
    Formal DFA for Error Code:
    S = {s0, s1, s2, s3, s4, s_trap}
    Sigma = {A-Z, 0-9}
    s0 = s0
    F = {s4}
    Format: E[0-9]{2}[A-Z], exactly 4 characters (e.g. E01A).
    """

    STATES = ["s0", "s1", "s2", "s3", "s4", "s_trap"]
    INITIAL_STATE = "s0"
    ACCEPTING_STATES = {"s4"}

    STATE_DESCRIPTIONS = {
        "s0": "Start state: Expecting prefix 'E'",
        "s1": "Matched 'E': Expecting 1st numeric digit [0-9]",
        "s2": "Matched 1st digit: Expecting 2nd numeric digit [0-9]",
        "s3": "Matched 2nd digit: Expecting category sub-code letter [A-Z]",
        "s4": "Accept state: Valid 4-character Error Code reached",
        "s_trap": "Trap state: Invalid character or incorrect length"
    }

    @classmethod
    def transition(cls, current_state: str, char: str) -> str:
        """Delta transition function for error code DFA"""
        if current_state == "s_trap":
            return "s_trap"

        if current_state == "s0":
            return "s1" if char == 'E' else "s_trap"
        elif current_state == "s1":
            return "s2" if char.isdigit() else "s_trap"
        elif current_state == "s2":
            return "s3" if char.isdigit() else "s_trap"
        elif current_state == "s3":
            return "s4" if char.isupper() and char.isalpha() else "s_trap"
        elif current_state == "s4":
            return "s_trap"

        return "s_trap"

    @classmethod
    def validate(cls, code: str) -> Tuple[bool, List[Dict[str, Any]], str]:
        """
        Validates Error Code via DFA execution and generates an execution trace.
        Returns: (is_valid, trace, explanation)
        """
        if not code or not isinstance(code, str):
            return False, [], "Error code cannot be empty or non-string."

        current_state = cls.INITIAL_STATE
        trace: List[Dict[str, Any]] = [
            {
                "step": 0,
                "input_char": "",
                "from_state": cls.INITIAL_STATE,
                "to_state": cls.INITIAL_STATE,
                "description": cls.STATE_DESCRIPTIONS[cls.INITIAL_STATE],
                "is_accepting": False
            }
        ]

        for i, char in enumerate(code):
            prev_state = current_state
            current_state = cls.transition(current_state, char)
            trace.append({
                "step": i + 1,
                "input_char": char,
                "from_state": prev_state,
                "to_state": current_state,
                "description": cls.STATE_DESCRIPTIONS.get(current_state, "Unknown state"),
                "is_accepting": current_state in cls.ACCEPTING_STATES
            })
            if current_state == "s_trap":
                break

        is_valid = (current_state in cls.ACCEPTING_STATES) and (len(code) == 4)

        if is_valid:
            message = f"Valid Error Code '{code}'. Successfully accepted by DFA in state s4."
        else:
            if len(code) != 4:
                message = f"Invalid Error Code length: {len(code)}, expected exactly 4 characters (E + 2 digits + 1 letter, e.g. E01A)."
            else:
                message = f"DFA transitioned to trap state 's_trap' due to invalid syntax."

        return is_valid, trace, message
