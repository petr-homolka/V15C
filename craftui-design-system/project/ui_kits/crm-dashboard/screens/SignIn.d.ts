import * as React from 'react';
export interface SignInProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Welcome to our CRM.\nSign In to see latest updates.". */
  text1?: string;
  /** Text content; defaults to "Enter your details to proceed further". */
  text2?: string;
  /** Text content; defaults to "Recover password". */
  text3?: string;
  /** Text content; defaults to "Or sign in with". */
  text4?: string;
}
export declare const SignIn: React.FC<SignInProps>;
export default SignIn;
