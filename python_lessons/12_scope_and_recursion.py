# ============================================================
# LESSON 12: Scope & Recursion
# ============================================================

# ==== SCOPE ====
# Scope = where in your code a variable is visible/accessible.

# ---- LOCAL scope — variable exists only inside the function ----
def my_function():
    local_var = "I am local"
    print(local_var)

my_function()
# print(local_var)   # NameError — not accessible here

# ---- GLOBAL scope — variable defined at module level ----
global_var = "I am global"

def show_global():
    print(global_var)   # can READ a global variable

show_global()

# ---- Modifying a global variable inside a function ----
counter = 0

def increment():
    global counter        # declare intent to modify global
    counter += 1

increment()
increment()
print(counter)   # 2

# Prefer returning values over modifying globals — cleaner code.

# ---- ENCLOSING scope (closure) ----
def outer():
    message = "hello from outer"

    def inner():
        print(message)   # inner sees outer's variable

    inner()

outer()

# ---- LEGB Rule ----
# Python searches scopes in this order:
# L — Local
# E — Enclosing
# G — Global
# B — Built-in  (e.g. len, print, range)

x = "global x"

def outer2():
    x = "enclosing x"
    def inner2():
        x = "local x"
        print(x)   # local x
    inner2()
    print(x)       # enclosing x

outer2()
print(x)           # global x


# ==== RECURSION ====
# A function that calls itself.
# Every recursive function needs:
# 1. A BASE CASE — when to stop.
# 2. A RECURSIVE CASE — call itself with a smaller problem.

# ---- Factorial: n! = n * (n-1) * ... * 1 ----
def factorial(n):
    if n == 0 or n == 1:   # base case
        return 1
    return n * factorial(n - 1)   # recursive case

print(factorial(5))    # 120
print(factorial(10))   # 3628800

# ---- Fibonacci ----
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

for i in range(8):
    print(fibonacci(i), end=" ")   # 0 1 1 2 3 5 8 13
print()

# ---- Sum of a list recursively ----
def recursive_sum(lst):
    if not lst:            # base case: empty list
        return 0
    return lst[0] + recursive_sum(lst[1:])

print(recursive_sum([1, 2, 3, 4, 5]))   # 15

# ---- Power ----
def power(base, exp):
    if exp == 0:
        return 1
    return base * power(base, exp - 1)

print(power(2, 8))   # 256

# Note: Python has a recursion limit (~1000 calls deep).
# For deep recursion, use loops instead.

# ============================================================
# EXERCISES
# ============================================================
# 1. Write a recursive function to count down from n to 0.
# 2. Write a recursive function to reverse a string.
#    Hint: reverse("hello") = reverse("ello") + "h"
# 3. Write a recursive function to find the greatest common
#    divisor (GCD) using Euclid's algorithm:
#    gcd(a, b) = gcd(b, a % b),  gcd(a, 0) = a
