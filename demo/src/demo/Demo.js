export const exampleCode = "/*\n" +
    " ******************************************************************************\n" +
    " *\n" +
    " *\n" +
    " * This is an example javascript code. \n" +
    " * You can edit this and click bottom button or type Ctrl + S to save this file.\n" +
    " *\n" +
    " * Leetcode question: https://leetcode.cn/problems/add-two-numbers/\n" +
    " *\n" +
    " *\n" +
    " ******************************************************************************\n" +
    " **/\n" +
    "var addTwoNumbers = function(l1, l2) {\n" +
    "    let head = null, tail = null;\n" +
    "    let carry = 0;\n" +
    "    while (l1 || l2) {\n" +
    "        const n1 = l1 ? l1.val : 0;\n" +
    "        const n2 = l2 ? l2.val : 0;\n" +
    "        const sum = n1 + n2 + carry;\n" +
    "        if (!head) {\n" +
    "            head = tail = new ListNode(sum % 10);\n" +
    "        } else {\n" +
    "            tail.next = new ListNode(sum % 10);\n" +
    "            tail = tail.next;\n" +
    "        }\n" +
    "        carry = Math.floor(sum / 10);\n" +
    "        if (l1) {\n" +
    "            l1 = l1.next;\n" +
    "        }\n" +
    "        if (l2) {\n" +
    "            l2 = l2.next;\n" +
    "        }\n" +
    "    }\n" +
    "    if (carry > 0) {\n" +
    "        tail.next = new ListNode(carry);\n" +
    "    }\n" +
    "    return head;\n" +
    "};"