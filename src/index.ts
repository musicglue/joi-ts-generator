export default function cloneJoiSchema <T>(schema: T): T {
  return (schema as any).clone();
}
