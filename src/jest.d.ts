// Jest type declarations (temporary until @types/jest is installed)
declare const describe: jest.Describe;
declare const it: jest.It;
declare const expect: jest.Expect;
declare const beforeEach: jest.Lifecycle;
declare const afterEach: jest.Lifecycle;
declare const jest: jest.Jest;

declare namespace jest {
  type Mocked<T> = {
    [P in keyof T]: T[P] extends (...args: any[]) => any 
      ? Mock & T[P] 
      : T[P] extends { [key: string]: any }
      ? Mocked<T[P]>
      : T[P];
  };
  type MockedClass<T> = {
    new (...args: any[]): T;
    (...args: any[]): T;
  } & {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? Mock : T[K];
  };
  interface Describe {
    (name: string, fn: () => void): void;
  }
  interface It {
    (name: string, fn: () => void | Promise<void>): void;
  }
  interface Expect {
    (value: any): any;
    any: any;
  }
  interface Lifecycle {
    (fn: () => void | Promise<void>): void;
  }
  interface Jest {
    fn: () => Mock;
    mock: (module: string, factory?: () => any) => void;
    clearAllMocks: () => void;
    spyOn: (object: any, method: string) => SpyInstance;
    Mocked: Mocked<any>;
  }
  interface Mock {
    (...args: any[]): any;
    mockResolvedValue: (value?: any) => Mock;
    mockRejectedValue: (value: any) => Mock;
    mockReturnValue: (value: any) => Mock;
    mockReturnThis: () => Mock;
    mockImplementation: (fn?: (...args: any[]) => any) => Mock;
    mock: {
      calls: any[][];
      results: any[];
    };
  }
  interface SpyInstance {
    (...args: any[]): any;
    mockResolvedValue: (value: any) => SpyInstance;
    mockRejectedValue: (value: any) => SpyInstance;
    mockReturnValue: (value: any) => SpyInstance;
    mockReturnThis: () => SpyInstance;
    mockImplementation: (fn?: (...args: any[]) => any) => SpyInstance;
    mockRestore: () => void;
    mock: {
      calls: any[][];
      results: any[];
    };
  }
}

