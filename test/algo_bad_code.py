def create_big_string(n):
    """
    TEST CASE 1: TLE / Efficiency
    Problem: String concatenation in a loop is O(N^2) in Python because strings are immutable.
    Expected Warning: Suggest using list join i.e., "".join(list)
    """
    result = ""
    for i in range(n):
        result += str(i) # <--- AI Should flag this as inefficient
    return result

def find_target(nums, target):
    """
    TEST CASE 2: Logic / Edge Case
    Problem: Doesn't handle if nums is None.
    """
    # Missing: if nums is None: return -1
    for i in range(len(nums)):
        if nums[i] == target:
            return i
    return -1

def factorial(n):
    """
    TEST CASE 3: Recursion Depth
    Problem: No base case handling for negative numbers, potential stack overflow.
    """
    if n == 0:
        return 1
    return n * factorial(n - 1)
