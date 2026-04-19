# ============================================================
# LESSON 09: Tuples & Sets
# ============================================================

# ==== TUPLES ====
# Ordered, IMMUTABLE (cannot be changed after creation).
# Use tuples for data that should not change.

point   = (3, 7)
person  = ("Alice", 30, "Engineer")
single  = (42,)      # note the trailing comma — required for 1 item
empty   = ()

print(point)
print(person[0])     # Alice — indexing works like lists
print(person[1:])    # (30, 'Engineer') — slicing too

# ---- Unpacking ----
x, y = point
print(f"x={x}, y={y}")

name, age, job = person
print(name, age, job)

# ---- Why use tuples? ----
# 1. They're faster than lists.
# 2. They protect data from accidental changes.
# 3. They can be used as dictionary keys (lists cannot).

# ---- Tuple methods ----
colors = ("red", "blue", "red", "green", "red")
print(colors.count("red"))   # 3
print(colors.index("blue"))  # 1

# ---- Converting between list and tuple ----
my_list  = [1, 2, 3]
my_tuple = tuple(my_list)
back     = list(my_tuple)
print(my_tuple, type(my_tuple))
print(back, type(back))

# ---- Tuple as return value from a function ----
def min_max(numbers):
    return min(numbers), max(numbers)   # returns a tuple

low, high = min_max([4, 1, 9, 2, 7])
print(f"Min={low}, Max={high}")


# ==== SETS ====
# Unordered, MUTABLE, NO DUPLICATE values.
# Great for membership testing and removing duplicates.

fruits = {"apple", "banana", "cherry", "apple", "banana"}
print(fruits)   # duplicates removed automatically

# ---- Creating a set from a list ----
nums = [1, 2, 2, 3, 3, 3, 4]
unique = set(nums)
print(unique)   # {1, 2, 3, 4}

# ---- Adding & Removing ----
fruits.add("date")
fruits.discard("banana")   # safe — no error if not found
fruits.remove("cherry")    # raises error if not found
print(fruits)

# ---- SET OPERATIONS ----
a = {1, 2, 3, 4, 5}
b = {4, 5, 6, 7, 8}

print(a | b)    # union        — all elements from both
print(a & b)    # intersection — only common elements
print(a - b)    # difference   — in a but not in b
print(a ^ b)    # symmetric difference — in one but not both

# ---- Membership test (very fast in sets) ----
big_set = set(range(1_000_000))
print(999999 in big_set)   # True — near-instant lookup

# ---- Frozen set (immutable set) ----
fs = frozenset([1, 2, 3])
# fs.add(4)   # would raise an error

# ---- Subset / Superset checks ----
x = {1, 2}
y = {1, 2, 3, 4}
print(x.issubset(y))    # True  — x is a subset of y
print(y.issuperset(x))  # True  — y contains all of x

# ============================================================
# EXERCISES
# ============================================================
# 1. Create a tuple (lat, lon) = (40.7128, -74.0060) and unpack it.
# 2. Remove duplicates from: [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
# 3. Given students_A = {"Ali","Sara","Tom"} and
#    students_B = {"Sara","Tom","Zoe"}, find who is in BOTH classes.
