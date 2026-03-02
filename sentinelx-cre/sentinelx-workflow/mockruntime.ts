import fetch from "node-fetch"; // npm install node-fetch@3

export const mockRuntime = {
  httpClient: {
    get: async (url: string) => {
      const res = await fetch(url);
      return res;
    },
  },
};
