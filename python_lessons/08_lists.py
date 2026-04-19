# ============================================================
# LESSON 08: Lists
# ============================================================
# A list is an ordered, mutable (changeable) collection.
# Lists can hold mixed types, but usually hold one type.

numbers = [1, 2, 3, 4, 5]
mixed   = [42, "hello", 3.14, True]
empty   = []

print(numbers)
print(mixed)

# ---- INDEXING & SLICING ----
fruits = ["apple", "banana", "cherry", "date", "elderberry"]

print(fruits[0])     # apple
print(fruits[-1])    # elderberry
print(fruits[1:3])   # ['banana', 'cherry']
print(fruits[:3])    # first 3
print(fruits[2:])    # from index 2 onward
print(fruits[::2])   # every other item

# ---- MODIFYING ITEMS ----
fruits[0] = "avocado"
print(fruits)

# ---- ADDING ITEMS ----
fruits.append("fig")          # add to end
fruits.insert(1, "blueberry") # insert at index
print(fruits)

# ---- REMOVING ITEMS ----
fruits.remove("date")         # remove by value (first match)
popped = fruits.pop()         # remove & return last item
popped2 = fruits.pop(0)       # remove & return item at index 0
print(fruits)
print("Popped:", popped, popped2)

# ---- USEFUL LIST METHODS ----
nums = [3, 1, 4, 1, 5, 9, 2, 6]

print(len(nums))          # 8   — length
print(min(nums))          # 1   — smallest
print(max(nums))          # 9   — largest
print(sum(nums))          # 31  — total
print(nums.count(1))      # 2   — count occurrences
print(nums.index(9))      # 5   — first index of value

nums.sort()
print(nums)               # sorted ascending
nums.sort(reverse=True)
print(nums)               # sorted descending

nums2 = sorted([5, 2, 8, 1])   # sorted() returns a NEW list
print(nums2)

nums.reverse()
print(nums)               # reversed in place

# ---- COPYING A LIST ----
original = [1, 2, 3]
copy1 = original.copy()   # correct
copy2 = original[:]       # also correct
wrong = original          # WRONG: both point to same list!

wrong.append(99)
print(original)   # [1, 2, 3, 99] — original was changed!
print(copy1)      # [1, 2, 3]     — safe copy

# ---- LIST COMPREHENSION ----
# Compact way to build a list
squares  = [x**2 for x in range(1, 6)]
evens    = [x for x in range(20) if x % 2 == 0]
print(squares)   # [1, 4, 9, 16, 25]
print(evens)     # [0, 2, 4, ... 18]

# ---- JOINING LISTS ----
a = [1, 2, 3]
b = [4, 5, 6]
print(a + b)       # [1, 2, 3, 4, 5, 6]
print(a * 3)       # [1, 2, 3, 1, 2, 3, 1, 2, 3]

# ---- CHECKING MEMBERSHIP ----
print("apple" in fruits)    # True or False
print("mango" not in fruits)

# ---- NESTED LISTS (2D) ----
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]
print(matrix[1][2])   # 6 (row 1, col 2)

# ============================================================
# EXERCISES
# ============================================================
# 1. Create a list of 5 favourite movies and print each with its number.
# 2. Given nums = [4, 7, 2, 9, 1, 5], sort descending and print.
# 3. Use a list comprehension to make a list of cubes of 1-10.
