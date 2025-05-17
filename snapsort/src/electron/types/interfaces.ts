export interface RunPythonOptions {
  directory: string;
  destination_directory: string;
  onLog?: (data: string) => void;
  onError?: (data: string) => void;
}