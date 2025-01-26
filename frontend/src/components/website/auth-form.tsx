'use client';

import Link from 'next/link';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { providers } from '@/providers';
import { AtSign, Eye, EyeOff, Check, X, User } from 'lucide-react';

/**
 * AuthForm Component - Handles user authentication forms with various input types and validation
 * @param props Component properties including form configuration and callbacks
 */
export default function AuthForm(props: {
  title: string;
  description?: string;
  providers: boolean;
  form: Array<any>;
  button: string;
  forgot_password?: boolean;
  policies?: boolean;
  btn_loading?: boolean;
  action: (_: FormData) => void;
}) {
  const router = useRouter();
  const [isDisabled, setIsDisabled] = useState(true);
  const ref = useRef<HTMLFormElement | null>(null);
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  /**
   * Validates if all required form fields have values
   * @returns {boolean} True if any field is empty, false if all fields are filled
   */
  function checkFormValidity() {
    const formElement = ref.current;
    if (!formElement) return true;
    const formData = new FormData(formElement);

    for (let i = 0; i < props.form.length; i++) {
      if (!formData.get(props.form[i].name)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Effect hook to handle form input change events and update disabled state
   */
  useEffect(() => {
    const formElement = ref.current;
    if (!formElement) return;

    const handleInputChange = () => {
      setIsDisabled(checkFormValidity());
    };

    const inputs = formElement.querySelectorAll('input');
    inputs.forEach((input) => {
      input.addEventListener('input', handleInputChange);
    });

    return () => {
      inputs.forEach((input) => {
        input.removeEventListener('input', handleInputChange);
      });
    };
  }, []);

  /**
   * Evaluates password strength against defined requirements
   * @param {string} pass Password to evaluate
   * @returns Array of requirement objects with met status
   */
  const checkPasswordStrength = (pass: string) => {
    const requirements = [
      { regex: /.{8,}/, text: 'At least 8 characters' },
      { regex: /[0-9]/, text: 'At least 1 number' },
      { regex: /[a-z]/, text: 'At least 1 lowercase letter' },
      { regex: /[A-Z]/, text: 'At least 1 uppercase letter' },
    ];

    return requirements.map((req) => ({
      met: req.regex.test(pass),
      text: req.text,
    }));
  };

  const passwordStrength = checkPasswordStrength(password);
  const passwordStrengthScore = passwordStrength.filter((req) => req.met).length;

  /**
   * Returns appropriate background color class based on password strength score
   */
  const getPasswordStrengthColor = (score: number) => {
    if (score === 0) return 'bg-border';
    if (score <= 1) return 'bg-red-500';
    if (score <= 2) return 'bg-orange-500';
    if (score === 3) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  /**
   * Returns descriptive text based on password strength score
   */
  const getPasswordStrengthText = (score: number) => {
    if (score === 0) return 'Enter a password';
    if (score <= 2) return 'Weak password';
    if (score === 3) return 'Medium password';
    return 'Strong password';
  };

  return (
    <form
      className='flex w-full items-center justify-center'
      ref={ref}
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        props.action(formData);
      }}
    >
      <div className='flex w-[500px] flex-col gap-[10px] rounded-[16px] border shadow-sm shadow-black/5 bg-accent p-[30px]'>
        <div
          className={`${props.description ? '' : 'mb-5'} text-2xl font-medium`}
        >
          {props.title}
        </div>
        {props.description && (
          <div className='mb-5 text-sm'>{props.description}</div>
        )}

        {props.providers && (
          <div className='flex flex-col gap-[10px]'>
            {providers.map((provider: any) => {
              return (
                <div
                  key={provider.type}
                  className='flex w-full cursor-pointer shadow-sm shadow-black/5 items-center justify-center gap-[10px] rounded-[12px] bg-background py-[10px] text-[14px] font-medium hover:opacity-70 active:scale-[0.98] active:opacity-60'
                  onClick={() => {
                    router.push(
                      `${process.env.NEXT_PUBLIC_API_URL}/oauth/${provider.name.toLowerCase()}?state=auth.`,
                    );
                  }}
                >
                  {provider.logo}
                  Continue with {provider.name}
                </div>
              );
            })}
            <div className='mt-[20px] flex w-full items-center justify-center text-sm text-secondary'>
              Or
            </div>
          </div>
        )}

        <div className='flex flex-col gap-[20px]'>
          {props.form.map((input, i) => {
            if (input.type === 'email') {
              return (
                <div className='flex w-full flex-col gap-3' key={i}>
                  <Label htmlFor={input.name}>Email</Label>
                  <div className='relative'>
                    <Input
                      id={input.name}
                      placeholder='Email'
                      type='email'
                      name={input.name}
                      defaultValue={input.default}
                      className='peer h-11 w-full rounded-[12px] ps-9'
                    />
                    <div className='pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50'>
                      <AtSign size={16} strokeWidth={2} aria-hidden='true' />
                    </div>
                  </div>
                </div>
              );
            } else if (input.type === 'password') {
              return (
                <div className='flex w-full flex-col gap-3' key={i}>
                  <Label htmlFor={input.name}>Password</Label>
                  <div className='relative'>
                    <Input
                      id={input.name}
                      placeholder='Password'
                      type={isPasswordVisible ? 'text' : 'password'}
                      name={input.name}
                      defaultValue={input.default}
                      className='peer h-11 w-full rounded-[12px] pe-9'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      className='absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
                      type='button'
                      onClick={() => setIsPasswordVisible((prev) => !prev)}
                      aria-label={
                        isPasswordVisible ? 'Hide password' : 'Show password'
                      }
                      aria-pressed={isPasswordVisible}
                      aria-controls='password'
                    >
                      {isPasswordVisible ? (
                        <EyeOff size={16} strokeWidth={2} aria-hidden='true' />
                      ) : (
                        <Eye size={16} strokeWidth={2} aria-hidden='true' />
                      )}
                    </button>
                  </div>
                  <div
                    className='mb-4 mt-3 h-1 w-full overflow-hidden rounded-full bg-border'
                    role='progressbar'
                    aria-valuenow={passwordStrengthScore}
                    aria-valuemin={0}
                    aria-valuemax={4}
                    aria-label='Password strength'
                  >
                    <div
                      className={`h-full ${getPasswordStrengthColor(
                        passwordStrengthScore,
                      )} transition-all duration-500 ease-out`}
                      style={{ width: `${(passwordStrengthScore / 4) * 100}%` }}
                    ></div>
                  </div>
                  <p className='mb-2 text-sm font-medium text-foreground'>
                    {getPasswordStrengthText(passwordStrengthScore)}. Must
                    contain:
                  </p>
                  <ul
                    className='space-y-1.5'
                    aria-label='Password requirements'
                  >
                    {passwordStrength.map((req, index) => (
                      <li key={index} className='flex items-center gap-2'>
                        {req.met ? (
                          <Check
                            size={16}
                            className='text-emerald-500'
                            aria-hidden='true'
                          />
                        ) : (
                          <X
                            size={16}
                            className='text-muted-foreground/80'
                            aria-hidden='true'
                          />
                        )}
                        <span
                          className={`text-xs ${
                            req.met
                              ? 'text-emerald-600'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {req.text}
                          <span className='sr-only'>
                            {req.met
                              ? ' - Requirement met'
                              : ' - Requirement not met'}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            } else if (input.type === 'password-normal') {
              return (
                <div className='flex w-full flex-col gap-3' key={i}>
                  <Label htmlFor={input.name}>Password</Label>
                  <div className='relative'>
                    <Input
                      id={input.name}
                      placeholder='Password'
                      type={isPasswordVisible ? 'text' : 'password'}
                      name={input.name}
                      defaultValue={input.default}
                      className='peer h-11 w-full rounded-[12px] pe-9'
                    />
                    <button
                      className='absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
                      type='button'
                      onClick={() => setIsPasswordVisible((prev) => !prev)}
                      aria-label={
                        isPasswordVisible ? 'Hide password' : 'Show password'
                      }
                      aria-pressed={isPasswordVisible}
                      aria-controls='password'
                    >
                      {isPasswordVisible ? (
                        <EyeOff size={16} strokeWidth={2} aria-hidden='true' />
                      ) : (
                        <Eye size={16} strokeWidth={2} aria-hidden='true' />
                      )}
                    </button>
                  </div>
                </div>
              );
            } else if (input.type === 'name') {
              return (
                <div className='flex w-full flex-col gap-3' key={i}>
                  <Label htmlFor={input.name}>Name</Label>
                  <div className='relative'>
                    <Input
                      id={input.name}
                      placeholder='Name'
                      type='text'
                      name={input.name}
                      defaultValue={input.default}
                      className='peer h-11 w-full rounded-[12px] ps-9'
                    />
                    <div className='pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50'>
                      <User size={16} strokeWidth={2} aria-hidden='true' />
                    </div>
                  </div>
                </div>
              );
            } else {
              return (
                <div className='flex flex-col gap-[5px]' key={i}>
                  <Label className='text-sm'>{input.label}</Label>
                  <Input
                    type={input.type}
                    name={input.name}
                    defaultValue={input.default}
                    placeholder={input.placeholder}
                    className='h-11 rounded-[12px] bg-background py-2'
                  />
                </div>
              );
            }
          })}
          <Button
            className='h-11 rounded-[12px]'
            type='submit'
            disabled={isDisabled || props.btn_loading}
            loading={props.btn_loading}
          >
            {props.button}
          </Button>

          {props.forgot_password && (
            <Link className='w-fit text-sm text-secondary' href={'/reset'}>
              Forgot password?
            </Link>
          )}
        </div>

        {props.policies && (
          <div className='mt-5 flex flex-col items-center justify-center gap-2 text-center'>
            <div className='text-sm'>
              By continuing, you agree to our policies
            </div>
            <div className='flex items-center gap-2 text-center text-sm font-semibold'>
              <Link href='/terms'>Terms of use</Link>
              <div>•</div>
              <Link href='/privacy'>Privacy policy</Link>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
