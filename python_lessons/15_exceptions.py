# ============================================================
# LESSON 15: Exception Handling (try / except)
# ============================================================
# Exceptions are errors that occur at runtime.
# Handling them prevents your program from crashing.

# ---- Without handling (program crashes) ----
# print(1 / 0)            # ZeroDivisionError
# print(int("hello"))     # ValueError
# print(x)                # NameError — x not defined

# ---- Basic try / except ----
try:
    result = 10 / 0
except ZeroDivisionError:
    print("Cannot divide by zero!")

# ---- Catching the error message ----
try:
    number = int("abc")
except ValueError as e:
    print(f"ValueError caught: {e}")

# ---- Multiple except blocks ----
def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        print("Error: division by zero")
        return None
    except TypeError:
        print("Error: inputs must be numbers")
        return None

print(safe_divide(10, 2))    # 5.0
print(safe_divide(10, 0))    # Error + None
print(safe_divide(10, "x"))  # Error + None

# ---- Catching multiple exceptions in one line ----
try:
    val = int(input("Enter a number: "))
    print(100 / val)
except (ValueError, ZeroDivisionError) as e:
    print(f"Input error: {e}")

# ---- else — runs if NO exception occurred ----
try:
    n = int(input("Enter another number: "))
except ValueError:
    print("That's not a valid number.")
else:
    print(f"You entered: {n}")        # only runs on success

# ---- finally — ALWAYS runs (cleanup code) ----
try:
    f = open("some_file.txt", "r")
    content = f.read()
except FileNotFoundError:
    print("File not found!")
finally:
    print("Done attempting to open file.")   # always runs

# ---- COMMON BUILT-IN EXCEPTIONS ----
# ValueError       — wrong value type or format
# TypeError        — wrong data type used
# IndexError       — list index out of range
# KeyError         — dict key doesn't exist
# ZeroDivisionError
# FileNotFoundError
# AttributeError   — object doesn't have that attribute
# NameError        — variable doesn't exist
# OverflowError    — number too large

# ---- Demonstrating common exceptions ----
def demo_exceptions():
    examples = [
        ("int('abc')",          lambda: int('abc')),
        ("[][5]",               lambda: [][5]),
        ("{}['x']",             lambda: {}['x']),
        ("1/0",                 lambda: 1/0),
        ("'hi'.nonexistent()",  lambda: 'hi'.nonexistent()),
    ]
    for desc, fn in examples:
        try:
            fn()
        except Exception as e:
            print(f"{desc:30s} → {type(e).__name__}: {e}")

demo_exceptions()

# ---- RAISING YOUR OWN EXCEPTIONS ----
def set_age(age):
    if not isinstance(age, int):
        raise TypeError("Age must be an integer")
    if age < 0 or age > 150:
        raise ValueError(f"Age {age} is out of realistic range")
    return age

try:
    print(set_age(25))
    print(set_age(-5))
except ValueError as e:
    print(f"Bad age: {e}")

# ---- CUSTOM EXCEPTION CLASSES ----
class InsufficientFundsError(Exception):
    """Raised when a bank withdrawal exceeds the balance."""
    def __init__(self, amount, balance):
        self.amount  = amount
        self.balance = balance
        super().__init__(f"Cannot withdraw {amount}; balance is {balance}")

def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientFundsError(amount, balance)
    return balance - amount

try:
    new_balance = withdraw(100, 150)
except InsufficientFundsError as e:
    print(e)

# ============================================================
# MINI PROJECT: Robust number input
# ============================================================
def get_positive_int(prompt):
    """Keep asking until the user gives a valid positive integer."""
    while True:
        try:
            value = int(input(prompt))
            if value <= 0:
                raise ValueError("Must be positive")
            return value
        except ValueError as e:
            print(f"Invalid input: {e}. Try again.")

n = get_positive_int("Enter a positive integer: ")
print(f"You entered: {n}")

# ============================================================
# EXERCISES
# ============================================================
# 1. Write a function that opens a file and returns its content.
#    Handle FileNotFoundError and PermissionError gracefully.
# 2. Write a safe_sqrt function that raises ValueError for
#    negative numbers and returns the square root otherwise.
# 3. Create a BelowZeroError custom exception. Write a
#    temperature setter that raises it if temp < -273.15 (absolute zero).
