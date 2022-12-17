export interface CommandType {
  key: string;
  title: string;
  group: string;
  usage: string;
  description: string;
  example: Array<{
    cmd: string;
    des?: string;
  }>;
}
