// Title: Maximum Subarray
            // Difficulty: Medium
            // Language: TypeScript
            // Link: https://leetcode.com/problems/maximum-subarray/

    let maxSum = nums[0];
    let currSum = 0;

    for (let i = 0; i < nums.length; i++) {
        currSum = Math.max(currSum, 0) + nums[i];
        maxSum = Math.max(maxSum, currSum);
    }
    return maxSum;
};
function maxSubArray(nums: number[]): number {