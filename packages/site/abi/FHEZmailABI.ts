export const FHEZmailABI = {
  abi: [
    {
      inputs: [
        {
          internalType: "address",
          name: "user",
          type: "address",
        },
      ],
      name: "archive",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "id",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "threadId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint64",
              name: "time",
              type: "uint64",
            },
            {
              internalType: "enum FHEZmail.Box",
              name: "box",
              type: "uint8",
            },
            {
              internalType: "euint256[]",
              name: "subjectCT",
              type: "bytes32[]",
            },
            {
              internalType: "euint256[]",
              name: "bodyCT",
              type: "bytes32[]",
            },
          ],
          internalType: "struct FHEZmail.Mail[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "mailId",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
      ],
      name: "forward",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "user",
          type: "address",
        },
      ],
      name: "inbox",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "id",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "threadId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint64",
              name: "time",
              type: "uint64",
            },
            {
              internalType: "enum FHEZmail.Box",
              name: "box",
              type: "uint8",
            },
            {
              internalType: "euint256[]",
              name: "subjectCT",
              type: "bytes32[]",
            },
            {
              internalType: "euint256[]",
              name: "bodyCT",
              type: "bytes32[]",
            },
          ],
          internalType: "struct FHEZmail.Mail[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "mails",
      outputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "threadId",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint64",
          name: "time",
          type: "uint64",
        },
        {
          internalType: "enum FHEZmail.Box",
          name: "box",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256[]",
          name: "mailIds",
          type: "uint256[]",
        },
        {
          internalType: "enum FHEZmail.Box",
          name: "newBox",
          type: "uint8",
        },
      ],
      name: "move",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "user",
          type: "address",
        },
      ],
      name: "myMailsOf",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "id",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "threadId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint64",
              name: "time",
              type: "uint64",
            },
            {
              internalType: "enum FHEZmail.Box",
              name: "box",
              type: "uint8",
            },
            {
              internalType: "euint256[]",
              name: "subjectCT",
              type: "bytes32[]",
            },
            {
              internalType: "euint256[]",
              name: "bodyCT",
              type: "bytes32[]",
            },
          ],
          internalType: "struct FHEZmail.Mail[]",
          name: "out",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "threadId",
          type: "uint256",
        },
      ],
      name: "myThread",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "id",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "threadId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint64",
              name: "time",
              type: "uint64",
            },
            {
              internalType: "enum FHEZmail.Box",
              name: "box",
              type: "uint8",
            },
            {
              internalType: "euint256[]",
              name: "subjectCT",
              type: "bytes32[]",
            },
            {
              internalType: "euint256[]",
              name: "bodyCT",
              type: "bytes32[]",
            },
          ],
          internalType: "struct FHEZmail.Mail[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "user",
          type: "address",
        },
      ],
      name: "read",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "id",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "threadId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint64",
              name: "time",
              type: "uint64",
            },
            {
              internalType: "enum FHEZmail.Box",
              name: "box",
              type: "uint8",
            },
            {
              internalType: "euint256[]",
              name: "subjectCT",
              type: "bytes32[]",
            },
            {
              internalType: "euint256[]",
              name: "bodyCT",
              type: "bytes32[]",
            },
          ],
          internalType: "struct FHEZmail.Mail[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "threadId",
          type: "uint256",
        },
        {
          internalType: "externalEuint256[]",
          name: "subjectExternal",
          type: "bytes32[]",
        },
        {
          internalType: "bytes[]",
          name: "subjectProofs",
          type: "bytes[]",
        },
        {
          internalType: "externalEuint256[]",
          name: "bodyExternal",
          type: "bytes32[]",
        },
        {
          internalType: "bytes[]",
          name: "bodyProofs",
          type: "bytes[]",
        },
      ],
      name: "reply",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "externalEuint256[]",
          name: "subjectExternal",
          type: "bytes32[]",
        },
        {
          internalType: "bytes[]",
          name: "subjectProofs",
          type: "bytes[]",
        },
        {
          internalType: "externalEuint256[]",
          name: "bodyExternal",
          type: "bytes32[]",
        },
        {
          internalType: "bytes[]",
          name: "bodyProofs",
          type: "bytes[]",
        },
      ],
      name: "sendMail",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "user",
          type: "address",
        },
      ],
      name: "sent",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "id",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "threadId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint64",
              name: "time",
              type: "uint64",
            },
            {
              internalType: "enum FHEZmail.Box",
              name: "box",
              type: "uint8",
            },
            {
              internalType: "euint256[]",
              name: "subjectCT",
              type: "bytes32[]",
            },
            {
              internalType: "euint256[]",
              name: "bodyCT",
              type: "bytes32[]",
            },
          ],
          internalType: "struct FHEZmail.Mail[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "user",
          type: "address",
        },
      ],
      name: "spam",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "id",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "threadId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint64",
              name: "time",
              type: "uint64",
            },
            {
              internalType: "enum FHEZmail.Box",
              name: "box",
              type: "uint8",
            },
            {
              internalType: "euint256[]",
              name: "subjectCT",
              type: "bytes32[]",
            },
            {
              internalType: "euint256[]",
              name: "bodyCT",
              type: "bytes32[]",
            },
          ],
          internalType: "struct FHEZmail.Mail[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "user",
          type: "address",
        },
      ],
      name: "star",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "id",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "threadId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint64",
              name: "time",
              type: "uint64",
            },
            {
              internalType: "enum FHEZmail.Box",
              name: "box",
              type: "uint8",
            },
            {
              internalType: "euint256[]",
              name: "subjectCT",
              type: "bytes32[]",
            },
            {
              internalType: "euint256[]",
              name: "bodyCT",
              type: "bytes32[]",
            },
          ],
          internalType: "struct FHEZmail.Mail[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "user",
          type: "address",
        },
      ],
      name: "trash",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "id",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "threadId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint64",
              name: "time",
              type: "uint64",
            },
            {
              internalType: "enum FHEZmail.Box",
              name: "box",
              type: "uint8",
            },
            {
              internalType: "euint256[]",
              name: "subjectCT",
              type: "bytes32[]",
            },
            {
              internalType: "euint256[]",
              name: "bodyCT",
              type: "bytes32[]",
            },
          ],
          internalType: "struct FHEZmail.Mail[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],
};
