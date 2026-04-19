# ============================================================
# LESSON 16: Object-Oriented Programming — Basics
# ============================================================
# OOP organises code around OBJECTS — bundles of data + behaviour.
# A CLASS is a blueprint. An OBJECT is an instance of that blueprint.

# ---- Defining a Class ----
class Dog:
    # Class variable — shared by ALL instances
    species = "Canis familiaris"

    # __init__ is the constructor — runs when an object is created
    def __init__(self, name, breed, age):
        # Instance variables — unique to each object
        self.name  = name
        self.breed = breed
        self.age   = age

    # Instance method — always takes 'self' as first parameter
    def bark(self):
        return f"{self.name} says: Woof!"

    def description(self):
        return f"{self.name} is a {self.age}-year-old {self.breed}."

    # __str__ — what print() shows for the object
    def __str__(self):
        return f"Dog({self.name}, {self.breed}, {self.age})"

    # __repr__ — unambiguous representation for developers
    def __repr__(self):
        return f"Dog(name={self.name!r}, breed={self.breed!r}, age={self.age})"


# ---- Creating Objects (instances) ----
dog1 = Dog("Rex",    "German Shepherd", 3)
dog2 = Dog("Buddy",  "Labrador",        5)

print(dog1)                   # Dog(Rex, German Shepherd, 3)
print(dog1.bark())            # Rex says: Woof!
print(dog2.description())     # Buddy is a 5-year-old Labrador.
print(dog1.species)           # Canis familiaris
print(Dog.species)            # same — accessed from the class too

# ---- Modifying attributes ----
dog1.age = 4
print(dog1.age)               # 4
dog1.nickname = "Rexy"        # you can add attributes dynamically
print(dog1.nickname)

# ---- Class with a method that modifies state ----
class BankAccount:
    def __init__(self, owner, balance=0.0):
        self.owner   = owner
        self.balance = balance
        self._transactions = []   # convention: _ means "private"

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("Deposit must be positive")
        self.balance += amount
        self._transactions.append(f"+{amount}")
        return self.balance

    def withdraw(self, amount):
        if amount <= 0:
            raise ValueError("Withdrawal must be positive")
        if amount > self.balance:
            raise ValueError("Insufficient funds")
        self.balance -= amount
        self._transactions.append(f"-{amount}")
        return self.balance

    def statement(self):
        print(f"\nAccount: {self.owner}")
        print(f"Transactions: {', '.join(self._transactions)}")
        print(f"Balance: ${self.balance:.2f}")

    def __str__(self):
        return f"BankAccount({self.owner}, ${self.balance:.2f})"


acc1 = BankAccount("Abdurr", 1000)
acc1.deposit(500)
acc1.withdraw(200)
acc1.deposit(300)
acc1.statement()

try:
    acc1.withdraw(5000)
except ValueError as e:
    print(f"Error: {e}")

# ---- @property — getter/setter without explicit calls ----
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        return self._radius

    @radius.setter
    def radius(self, value):
        if value < 0:
            raise ValueError("Radius cannot be negative")
        self._radius = value

    @property
    def area(self):
        import math
        return math.pi * self._radius ** 2

    @property
    def circumference(self):
        import math
        return 2 * math.pi * self._radius

    def __str__(self):
        return f"Circle(radius={self._radius})"


c = Circle(5)
print(c.radius)           # 5
print(f"Area: {c.area:.2f}")           # 78.54
print(f"Circumference: {c.circumference:.2f}")  # 31.42
c.radius = 10
print(c)

# ---- Static & Class Methods ----
class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius

    @classmethod
    def from_fahrenheit(cls, f):
        """Alternate constructor."""
        return cls((f - 32) * 5 / 9)

    @staticmethod
    def is_valid(celsius):
        """No access to instance or class — pure utility."""
        return celsius >= -273.15

    def __str__(self):
        return f"{self.celsius:.1f}°C"


t1 = Temperature(100)
t2 = Temperature.from_fahrenheit(32)
print(t1)                         # 100.0°C
print(t2)                         # 0.0°C
print(Temperature.is_valid(-300)) # False

# ============================================================
# EXERCISES
# ============================================================
# 1. Create a Rectangle class with width and height.
#    Add methods: area(), perimeter(), is_square().
# 2. Create a Student class that tracks name, grades (list),
#    and has a method average() and a method passed() (avg >= 50).
# 3. Add a __len__ method to a Playlist class that returns
#    the number of songs.
