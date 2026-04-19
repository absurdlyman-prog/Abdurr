# ============================================================
# LESSON 03: Operators
# ============================================================

# ---- ARITHMETIC OPERATORS ----
a = 10
b = 3

print(a + b)   # 13  — addition
print(a - b)   # 7   — subtraction
print(a * b)   # 30  — multiplication
print(a / b)   # 3.333... — division (always returns float)
print(a // b)  # 3   — floor division (rounds DOWN)
print(a % b)   # 1   — modulus (remainder)
print(a ** b)  # 1000 — exponent (10 to the power of 3)

# ---- COMPARISON OPERATORS ----
# These return True or False
print(10 == 10)   # True  — equal to
print(10 != 5)    # True  — not equal to
print(10 > 5)     # True  — greater than
print(10 < 5)     # False — less than
print(10 >= 10)   # True  — greater than or equal
print(10 <= 9)    # False — less than or equal

# ---- ASSIGNMENT OPERATORS ----
score = 0
score += 5   # same as: score = score + 5
print(score) # 5
score -= 2   # same as: score = score - 2
print(score) # 3
score *= 4   # same as: score = score * 4
print(score) # 12
score //= 3  # same as: score = score // 3
print(score) # 4

# ---- LOGICAL OPERATORS ----
# and → True only if BOTH sides are True
# or  → True if AT LEAST one side is True
# not → flips True/False

is_sunny = True
is_warm  = False

print(is_sunny and is_warm)   # False
print(is_sunny or is_warm)    # True
print(not is_sunny)           # False

# Combining conditions
age = 20
has_id = True
print(age >= 18 and has_id)   # True — can enter

# ---- ORDER OF OPERATIONS ----
# Python follows PEMDAS / BODMAS:
# Parentheses → Exponent → Multiply/Divide → Add/Subtract
result = 2 + 3 * 4        # 14 (not 20)
result2 = (2 + 3) * 4     # 20
print(result, result2)

# ============================================================
# EXERCISES
# ============================================================
# 1. What is the remainder when 17 is divided by 5?  (use %)
# 2. Is 7 ** 2 equal to 50? Check with ==
# 3. Given age = 15 and has_parent = True,
#    print whether someone can watch a PG-13 movie:
#    (age >= 13 AND has_parent) OR age >= 18

age = 15
has_parent = True
can_watch = (age >= 13 and has_parent) or age >= 18
print("Can watch PG-13:", can_watch)
