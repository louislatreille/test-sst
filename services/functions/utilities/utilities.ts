export const validateEnvVariables = (variableName: string): string => {
  const value = process.env[variableName];

  if (value === undefined || value === "") {
    throw Error(`No ${variableName} environment variable defined...`);
  }

  return value;
};
