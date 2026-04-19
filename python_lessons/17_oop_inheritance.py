# ============================================================
# LESSON 17: OOP — Inheritance & Polymorphism
# ============================================================
# INHERITANCE lets a class reuse code from another class.
# Parent class (base) → Child class (derived/subclass)

# ---- Base Class ----
class Animal:
    def __init__(self, name, age):
        self.name = name
        self.age  = age

    def eat(self):
        return f"{self.name} is eating."

    def sleep(self):
        return f"{self.name} is sleeping."

    def speak(self):
        return f"{self.name} makes a sound."

    def __str__(self):
        return f"{type(self).__name__}(name={self.name}, age={self.age})"


# ---- Child Classes — inherit from Animal ----
class Dog(Animal):
    def __init__(self, name, age, breed):
        super().__init__(name, age)   # call parent __init__
        self.breed = breed

    # Override speak()
    def speak(self):
        return f"{self.name} says: Woof!"

    def fetch(self):
        return f"{self.name} fetches the ball!"


class Cat(Animal):
    def __init__(self, name, age, indoor=True):
        super().__init__(name, age)
        self.indoor = indoor

    def speak(self):
        return f"{self.name} says: Meow!"

    def purr(self):
        return f"{self.name} purrs..."


class Bird(Animal):
    def __init__(self, name, age, can_fly=True):
        super().__init__(name, age)
        self.can_fly = can_fly

    def speak(self):
        return f"{self.name} says: Tweet!"

    def fly(self):
        if self.can_fly:
            return f"{self.name} is flying!"
        return f"{self.name} cannot fly."


# ---- Using the classes ----
dog  = Dog("Rex",    3, "Labrador")
cat  = Cat("Whiskers", 5)
bird = Bird("Tweety", 1)
penguin = Bird("Pingu", 2, can_fly=False)

print(dog)
print(dog.speak())    # overridden
print(dog.eat())      # inherited from Animal
print(dog.fetch())    # Dog-specific

print(cat.speak())
print(cat.purr())

print(bird.fly())
print(penguin.fly())

# ---- POLYMORPHISM ----
# Same interface, different behaviour depending on the object.
animals = [dog, cat, bird, penguin]

for animal in animals:
    print(animal.speak())   # each calls its OWN speak()

# ---- isinstance() and issubclass() ----
print(isinstance(dog, Dog))     # True
print(isinstance(dog, Animal))  # True — Dog IS-A Animal
print(isinstance(cat, Dog))     # False

print(issubclass(Dog, Animal))  # True
print(issubclass(Cat, Dog))     # False

# ---- MULTIPLE INHERITANCE ----
class Flyable:
    def fly(self):
        return f"{self.name} soars through the air!"

class Swimmable:
    def swim(self):
        return f"{self.name} glides through the water!"

class Duck(Animal, Flyable, Swimmable):
    def speak(self):
        return f"{self.name} says: Quack!"

duck = Duck("Donald", 4)
print(duck.speak())
print(duck.fly())
print(duck.swim())
print(duck.eat())   # from Animal

# ---- ABSTRACT BASE CLASS ----
from abc import ABC, abstractmethod

class Shape(ABC):
    """Abstract class — cannot be instantiated directly."""

    @abstractmethod
    def area(self):
        pass

    @abstractmethod
    def perimeter(self):
        pass

    def describe(self):
        return f"I am a {type(self).__name__} with area {self.area():.2f}"


class Rectangle(Shape):
    def __init__(self, width, height):
        self.width  = width
        self.height = height

    def area(self):
        return self.width * self.height

    def perimeter(self):
        return 2 * (self.width + self.height)


class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius

    def area(self):
        import math
        return math.pi * self.radius ** 2

    def perimeter(self):
        import math
        return 2 * math.pi * self.radius


# shape = Shape()  # TypeError — can't instantiate abstract class

rect   = Rectangle(4, 6)
circle = Circle(5)

shapes = [rect, circle]
for s in shapes:
    print(s.describe())
    print(f"  Perimeter: {s.perimeter():.2f}")

# ---- METHOD RESOLUTION ORDER (MRO) ----
# Python uses C3 linearisation to determine which method to call.
print(Dog.__mro__)   # (Dog, Animal, object)
print(Duck.__mro__)  # (Duck, Animal, Flyable, Swimmable, object)

# ============================================================
# MINI PROJECT: Employee Management
# ============================================================
class Employee:
    company = "TechCorp"

    def __init__(self, name, salary):
        self.name   = name
        self.salary = salary

    def details(self):
        return f"{self.name} — ${self.salary:,.0f}/yr at {self.company}"

    def annual_bonus(self):
        return self.salary * 0.05


class Manager(Employee):
    def __init__(self, name, salary, department):
        super().__init__(name, salary)
        self.department = department
        self.team = []

    def hire(self, employee):
        self.team.append(employee)

    def annual_bonus(self):        # managers get 15%
        return self.salary * 0.15

    def details(self):
        base = super().details()
        return f"{base} | Dept: {self.department} | Team: {len(self.team)}"


emp  = Employee("Alice", 60_000)
mgr  = Manager("Bob",   90_000, "Engineering")
mgr.hire(emp)
mgr.hire(Employee("Carol", 65_000))

print(emp.details())
print(mgr.details())
print(f"Alice's bonus: ${emp.annual_bonus():,.0f}")
print(f"Bob's bonus:   ${mgr.annual_bonus():,.0f}")

# ============================================================
# CONGRATULATIONS!
# You have completed the Python basics curriculum!
# Topics covered:
#   01 Hello World        06 Conditionals       11 Functions
#   02 Variables/Types    07 Loops              12 Scope/Recursion
#   03 Operators          08 Lists              13 Modules
#   04 Strings            09 Tuples/Sets        14 File I/O
#   05 User Input         10 Dictionaries       15 Exceptions
#                                               16 OOP Basics
#                                               17 Inheritance
#
# Next steps to explore:
#   - List/dict/set comprehensions (advanced)
#   - Generators & iterators
#   - Decorators
#   - Context managers
#   - Virtual environments & pip
#   - Popular libraries: NumPy, Pandas, Flask, Requests
# ============================================================
