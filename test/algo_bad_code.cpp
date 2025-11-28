#include <vector>
#include <iostream>

using namespace std;

/**
 * TEST CASE 1: Integer Overflow
 * Problem: The sum of elements can reach 10^10, but 'int' usually caps at 2*10^9.
 * Expected Warning: "Potential Integer Overflow", suggest 'long long'.
 */
int calculateTotalSum(const vector<int>& nums) {
    int sum = 0;  // <--- AI Should flag this line
    for (int x : nums) {
        sum += x;
    }
    return sum;
}

/**
 * TEST CASE 2: Time Limit Exceeded (TLE)
 * Problem: Nested loops O(N^2) on a vector that could be N=10^5.
 * Expected Warning: "High time complexity O(N^2)", suggest using a Set or Hash Map.
 */
bool hasDuplicate(const vector<int>& nums) {
    // If N is 10^5, N^2 is 10^10 operations -> TLE (usually limit is 10^8 ops/sec)
    for(size_t i = 0; i < nums.size(); ++i) {
        for(size_t j = i + 1; j < nums.size(); ++j) { // <--- AI Should flag this logic
            if(nums[i] == nums[j]) {
                return true;
            }
        }
    }
    return false;
}

/**
 * TEST CASE 3: Memory / Edge Case
 * Problem: Accessing index without checking if vector is empty.
 * Expected Warning: "Potential out of bounds access" or "Unhandled empty vector".
 */
int getFirstElement(const vector<int>& nums) {
    return nums[0]; // <--- AI Should warn about empty vector check
}
