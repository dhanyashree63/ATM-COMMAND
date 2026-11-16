"""Simple ATM program with PIN verification and basic banking operations."""

PIN = "1234"
balance = 1000.0


def verify_pin():
    """Ask the user to enter the PIN and verify it."""
    entered_pin = input("Enter your PIN: ").strip()
    if entered_pin == PIN:
        return True
    else:
        print("Incorrect PIN. Access denied.")
        return False


def deposit():
    """Deposit money into the account."""
    global balance
    try:
        amount = float(input("Enter amount to deposit: "))
        if amount <= 0:
            print("Deposit amount must be positive.")
        else:
            balance += amount
            print(f"Deposit successful. Your balance is: {balance}")
    except ValueError:
        print("Invalid amount. Please enter a numeric value.")


def withdraw():
    """Withdraw money from the account if enough balance exists."""
    global balance
    try:
        amount = float(input("Enter amount to withdraw: "))
        if amount <= 0:
            print("Withdrawal amount must be positive.")
        elif amount > balance:
            print("Insufficient balance.")
        else:
            balance -= amount
            print(f"Withdrawal successful. Your balance is: {balance}")
    except ValueError:
        print("Invalid amount. Please enter a numeric value.")


def check_balance():
    """Display the current balance."""
    print(f"Your current balance is: {balance}")


def main():
    """Main ATM menu loop."""
    if not verify_pin():
        return

    while True:
        print("\nATM Menu")
        print("1. Deposit")
        print("2. Withdraw")
        print("3. Check Balance")
        print("4. Exit")

        try:
            choice = int(input("Enter your choice: "))

            if choice == 1:
                deposit()
            elif choice == 2:
                withdraw()
            elif choice == 3:
                check_balance()
            elif choice == 4:
                print("Thank you for using the ATM.")
                break
            else:
                print("Invalid choice. Please select 1, 2, 3, or 4.")
        except ValueError:
            print("Invalid input. Please enter a number.")


if __name__ == "__main__":
    main()
