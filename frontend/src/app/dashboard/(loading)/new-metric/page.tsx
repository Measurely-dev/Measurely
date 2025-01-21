'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import WebContainer from '@/components/website/container';
import ContentContainer from '@/components/website/content';
import AuthNavbar from '@/components/website/auth-navbar';
import Footer from '@/components/website/footer';
import { MetricType, UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import { toast } from 'sonner';
import { ProjectsContext } from '@/dash-context';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TabsContent } from '@radix-ui/react-tabs';
import { Step, StepItem, Stepper, useStepper } from '@/components/ui/stepper';
import { ConfettiButton } from '@/components/ui/confetti';
import { Skeleton } from '@/components/ui/skeleton';
import { CircleX, ClipboardList, Info, List, Loader, User } from 'lucide-react';

const forbidden = [
  'average',
  'average trend',
  'positive trend',
  'negative trend',
  'event count',
];

export default function NewMetric() {
  const [step, setStep] = useState(1);
  const [tab, setTab] = useState('metrics');
  const [value, setValue] = useState<MetricType>(
    tab === 'metrics' ? MetricType.Base : MetricType.Stripe,
  );
  const router = useRouter();
  const { projects, activeProject } = useContext(ProjectsContext);

  const metricTypes = [
    {
      label: 'metrics',
      types: [
        {
          name: 'Basic Metric',
          value: MetricType.Base,
          description:
            'Tracks a single, always-positive variable, perfect for monitoring growth, like total active users or daily logins.',
        },
        {
          name: 'Dual Variables Metric',
          value: MetricType.Dual,
          description:
            'This metric compares two opposing variables, allowing you to track both positive and negative influences on a key metric. For example, monitor user activity by measuring new account creations versus deletions, giving you a clear view of net growth or decline.',
        },
        {
          name: 'Average Metric',
          value: MetricType.Average,
          description:
            'An average metric tracks the average value of data over time, like session durations, revealing trends and typical performance.',
        },
      ],
    },
    {
      label: 'integrations',
      types: [
        {
          name: 'Stripe integration',
          value: MetricType.Stripe,
          description:
            'Integrates with Stripe to track payment-related metrics such as revenue, subscriptions, refunds, and payment intents. Useful for monitoring business performance and growth through financial data.',
        },
        {
          name: 'Google Analytics integration',
          value: MetricType.Google,
          description:
            'Tracks both positive and negative variables, useful for monitoring traffic sources, bounce rates, and conversion metrics.',
        },
        {
          name: 'AWS CloudWatch integration',
          value: MetricType.AWS,
          description:
            'Monitors cloud infrastructure performance metrics, ideal for tracking resource utilization and server health.',
        },
      ],
    },
  ];

  const renderStep = () => {
    switch (value) {
      case MetricType.Base:
        return <BasicAverageStep setStep={setStep} type={value} />;
      case MetricType.Average:
        return <BasicAverageStep setStep={setStep} type={value} />;
      case MetricType.Dual:
        return <DualStep setStep={setStep} />;
      case MetricType.Stripe:
        return <StripeStep setStep={setStep} />;
    }
  };

  const isComingSoon = (type: MetricType) => {
    return type === MetricType.Google || type === MetricType.AWS;
  };

  const stepLabels = [
    { label: 'Step 1' },
    { label: 'Step 2' },
  ] satisfies StepItem[];

  useEffect(() => {
    if (
      projects[activeProject].user_role !== UserRole.Admin &&
      projects[activeProject].user_role !== UserRole.Owner
    ) {
      router.push('/dashboard');
    }
  }, []);

  useEffect(() => {
    setValue(tab === 'metrics' ? MetricType.Base : MetricType.Stripe);
  }, [tab]);

  return (
    <div className='flex flex-col'>
      <WebContainer className='h-[100vh] min-h-[700px] w-[100vw]'>
        <AuthNavbar isDashboard href='/dashboard' button='Dashboard' />
        <ContentContainer className='flex h-full items-center justify-center'>
          <div className='mx-auto flex w-full max-w-[500px] flex-col gap-6'>
            <Stepper initialStep={0} steps={stepLabels} size='sm'>
              <Step label='Step 1' icon={List}>
                <div className='flex flex-col gap-[5px]'>
                  <div className='text-xl font-medium'>Choose metric type </div>
                  <div className='text-sm text-secondary'>
                    Select the type of metric you want to create
                  </div>
                </div>
                <Tabs
                  defaultValue='metrics'
                  className='flex flex-col gap-5'
                  onValueChange={(value) => setTab(value)}
                >
                  <TabsList className='mb-0 grid w-full grid-cols-2 rounded-[12px] border-0 font-sans font-medium'>
                    <TabsTrigger value='metrics' className='rounded-[10px]'>
                      Metrics
                    </TabsTrigger>
                    <TabsTrigger
                      value='integrations'
                      className='rounded-[10px]'
                    >
                      Integrations
                    </TabsTrigger>
                  </TabsList>
                  {metricTypes.map((metric) => (
                    <TabsContent
                      className='space-y-3'
                      value={metric.label}
                      key={metric.label}
                    >
                      {metric.types.map((type, j) => (
                        <Metric
                          key={j}
                          name={type.name}
                          value={type.value}
                          description={type.description}
                          state={value}
                          setState={setValue}
                          comingSoon={isComingSoon(type.value)}
                        />
                      ))}
                    </TabsContent>
                  ))}
                </Tabs>
              </Step>
              <Step label='Step 2' icon={ClipboardList}>
                {renderStep()}
              </Step>
              <StepperFooter />
            </Stepper>
          </div>
        </ContentContainer>
      </WebContainer>
      <Footer type='waitlist' border bg='secondary' isHome />
    </div>
  );
}

function StepperFooter() {
  const {
    nextStep,
    prevStep,
    hasCompletedAllSteps,
    isLastStep,
    resetSteps,
    isOptionalStep,
    isDisabledStep,
  } = useStepper();
  const isFailed = false;
  return (
    <>
      {hasCompletedAllSteps &&
        (isFailed ? (
          <>
            <div className='flex h-40 flex-col items-center justify-center gap-2 rounded-[12px] border border-destructive bg-destructive/5 text-destructive'>
              <div className='flex items-center gap-2'>
                <CircleX className='size-4' />
                <div className='text-sm font-medium'>
                  Failed to create metric
                </div>
              </div>
              <Button
                className='mt-2 w-fit rounded-[12px] border border-destructive bg-transparent text-destructive hover:bg-destructive/10'
                variant='destructive'
                onClick={() => {
                  resetSteps();
                }}
              >
                Retry
              </Button>
            </div>
          </>
        ) : (
          <Skeleton className='flex h-40 items-center justify-center gap-2 rounded-[12px] border'>
            <div className='text-sm font-medium text-muted-foreground'>
              Creating metric{' '}
            </div>{' '}
            <Loader className='size-4 animate-spin' />
          </Skeleton>
        ))}
      <div className='flex w-full justify-end gap-2'>
        {!hasCompletedAllSteps ? (
          <>
            {!isDisabledStep ? (
              <Button
                onClick={prevStep}
                className='w-full rounded-[12px]'
                variant='secondary'
              >
                Previous
              </Button>
            ) : null}

            {!isLastStep ? (
              <Button
                className='w-full rounded-[12px]'
                onClick={() => {
                  nextStep();
                }}
              >
                {isOptionalStep ? 'Skip' : 'Next'}
              </Button>
            ) : (
              <div className='relative w-full'>
                <ConfettiButton asChild disableConfetti={isFailed}>
                  <Button
                    className='w-full rounded-[12px]'
                    onClick={() => {
                      nextStep();
                    }}
                  >
                    Create
                  </Button>
                </ConfettiButton>
              </div>
            )}
          </>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}
function Metric(props: {
  name: string;
  value: number;
  description: string;
  state: any;
  setState: Dispatch<SetStateAction<number>>;
  comingSoon?: boolean;
}) {
  return (
    <div
      className={`flex w-full select-none flex-col gap-1 rounded-xl border p-3 transition-all duration-150 ${
        props.comingSoon
          ? 'cursor-not-allowed bg-accent'
          : props.state === props.value
            ? 'cursor-pointer bg-blue-500/5 ring-2 ring-blue-500'
            : 'cursor-pointer hover:bg-accent/50'
      }`}
      onClick={() => {
        if (!props.comingSoon) {
          props.setState(props.value);
        }
      }}
    >
      <div className='flex items-center gap-2'>
        <div className='text-sm font-medium'>{props.name}</div>
        {props.comingSoon && (
          <div className='text-xs text-blue-500'>coming soon</div>
        )}
      </div>
      <div className='text-xs font-light text-secondary'>
        {props.description}
      </div>
    </div>
  );
}

function BasicAverageStep(props: {
  setStep: Dispatch<SetStateAction<number>>;
  type: MetricType.Base | MetricType.Average;
}) {
  const [name, setName] = useState('');
  const [baseValue, setBaseValue] = useState<number | string>(0);
  const [loading, setLoading] = useState(false);
  const { projects, setProjects, activeProject } = useContext(ProjectsContext);
  const router = useRouter();

  return (
    <div className='mx-auto flex flex-col gap-6'>
      <div className='flex flex-col gap-[5px]'>
        <div className='text-xl font-medium'>
          {props.type === MetricType.Base ? 'Basic metric' : 'Average Metric'}
        </div>
        <div className='text-sm text-secondary'>
          {props.type === MetricType.Base
            ? 'Track a single value for straightforward metrics, ideal for simple counts or totals.'
            : 'Analyze trends with average metrics, perfect for monitoring performance over time.'}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setLoading(true);
            if (name === '') {
              toast.error('Please enter a name');
              setLoading(false);
              return;
            }

            if (forbidden.includes(name.toLowerCase())) {
              toast.error(
                'The variable names you have chosen are used internally, please choose something else.',
              );
              setLoading(false);
              return;
            }

            fetch(process.env.NEXT_PUBLIC_API_URL + '/metric', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                name: name,
                project_id: projects[activeProject].id,
                base_value: baseValue,
                type: props.type,
                name_pos: 'added',
                nameneg: 'removed',
              }),
            })
              .then((res) => {
                if (!res.ok) {
                  res.text().then((text) => {
                    toast.error(text);
                    setLoading(false);
                  });
                } else {
                  return res.json();
                }
              })
              .then((json) => {
                if (json === null || json === undefined) {
                  return;
                }
                setProjects(
                  projects.map((v, i) =>
                    i === activeProject
                      ? Object.assign({}, v, {
                          metrics: [
                            ...(projects[activeProject].metrics ?? []),
                            json,
                          ],
                        })
                      : v,
                  ),
                );

                toast.success('Metric was succesfully created');
                router.push(`/dashboard/metrics/${name}`);
              });
          }}
        >
          <div className='flex w-full flex-col gap-3'>
            <div className='my-2 flex flex-col gap-4'>
              <div className='flex w-full flex-col gap-3'>
                <Label>Metric name</Label>
                <Input
                  placeholder={
                    props.type === MetricType.Base
                      ? `New users, Deleted projects, Suspended accounts`
                      : 'Session duration, Ratings, Load time'
                  }
                  type='text'
                  maxLength={30}
                  className='h-11 rounded-[12px]'
                  value={name}
                  onChange={(e) => setName(e.target.value.trimStart())}
                />
              </div>
              <div className='flex w-full flex-col gap-3'>
                <Label>Base value</Label>
                <div className='flex flex-col gap-1'>
                  <Input
                    placeholder='Optional'
                    type='number'
                    min={0}
                    max={1000000000}
                    value={
                      baseValue === 0 && !Number(baseValue) ? '' : baseValue
                    }
                    onChange={(e) =>
                      setBaseValue(
                        e.target.value === '' ? '' : Number(e.target.value),
                      )
                    }
                    className='h-11 rounded-[12px]'
                  />
                  <Label className='text-xs font-normal leading-tight text-secondary'>
                    Base value stands for the value of the metric before using
                    Measurely to measure the metric
                  </Label>
                </div>
              </div>
            </div>
          </div>
          {/* 
          <div className='flex w-full flex-row gap-2 max-md:flex-col'>
            <Button
              type='button'
              variant='secondary'
              className='w-full rounded-[12px]'
              onClick={() => props.setStep(1)}
            >
              Back
            </Button>
            <Button
              type='submit'
              variant='default'
              loading={loading}
              disabled={name === '' || loading}
              className='w-full rounded-[12px]'
            >
              Create
            </Button>
          </div> */}
        </form>
      </div>
    </div>
  );
}

function DualStep(props: { setStep: Dispatch<SetStateAction<number>> }) {
  const [name, setName] = useState('');
  const [namePos, setNamePos] = useState('added');
  const [nameNeg, setNameNeg] = useState('removed');
  const [namingType, setNamingType] = useState('auto');

  const [baseValue, setBaseValue] = useState<number | string>(0);

  const [loading, setLoading] = useState(false);

  const { projects, setProjects, activeProject } = useContext(ProjectsContext);
  const router = useRouter();

  return (
    <div className='mx-auto flex flex-col gap-6'>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setLoading(true);
          if (name === '') {
            toast.error('Please enter a name');
            setLoading(false);
            return;
          }

          if (namePos === '' || nameNeg === '') {
            toast.error('You cannot have empty variable names');
            setLoading(false);
            return;
          }

          if (
            forbidden.includes(namePos.toLowerCase()) ||
            forbidden.includes(nameNeg.toLowerCase())
          ) {
            toast.error(
              'The variable names you have chosen are used internally, please choose something else.',
            );
            setLoading(false);
            return;
          }

          fetch(process.env.NEXT_PUBLIC_API_URL + '/metric', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              name: name,
              project_id: projects[activeProject].id,
              base_value: baseValue,
              type: MetricType.Dual,
              name_pos: namePos,
              nameneg: nameNeg,
            }),
          })
            .then((res) => {
              if (!res.ok) {
                res.text().then((text) => {
                  toast.error(text);
                  setLoading(false);
                });
              } else {
                return res.json();
              }
            })
            .then((json) => {
              if (
                json === null ||
                json === undefined ||
                projects[activeProject].metrics === null
              ) {
                return;
              }

              setProjects(
                projects.map((v, i) =>
                  i === activeProject
                    ? Object.assign({}, v, {
                        metrics: [
                          ...(projects[activeProject].metrics ?? []),
                          json,
                        ],
                      })
                    : v,
                ),
              );

              toast.success('Metric was succesfully created');
              router.push(`/dashboard/metrics/${name}`);
            });
        }}
      >
        <div className='flex flex-col gap-[5px]'>
          <div className='text-xl font-medium'>Dual metric</div>
          <div className='text-sm text-secondary'>
            Track metrics with positive and negative values, perfect for
            scenarios like gains and losses or approvals and rejections.
          </div>
          <div className='flex w-full flex-col gap-3'>
            <div className='my-2 flex flex-col gap-4'>
              <div className='flex w-full flex-col gap-3'>
                <Label>Metric name</Label>
                <Input
                  placeholder='Users, Transfers, Projects'
                  maxLength={30}
                  type='text'
                  value={name}
                  onChange={(e) => setName(e.target.value.trimStart())}
                  className='h-11 rounded-[12px]'
                />
              </div>

              <Label className='flex flex-col gap-3'>
                Variable names
                <Select
                  defaultValue={'auto'}
                  onValueChange={(e) => {
                    setNamingType(e);
                    if (e === 'manual') {
                      setNamePos('');
                      setNameNeg('');
                    } else {
                      setNamePos('added');
                      setNameNeg('removed');
                    }
                  }}
                >
                  <SelectTrigger className='h-11 border'>
                    <SelectValue placeholder='Select a type of naming' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={'auto'}>Automatic</SelectItem>
                      <SelectItem value={'manual'}>Manual</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Label className='text-xs font-normal leading-tight text-secondary'>
                  Customize the names for positive and negative values to match
                  your specific use case and improve clarity.
                </Label>
              </Label>
              <div className='flex w-full flex-col gap-3'>
                <Label>Base value</Label>
                <div className='flex flex-col gap-1'>
                  <Input
                    placeholder='Optional'
                    type='number'
                    min={-1000000000}
                    max={1000000000}
                    value={
                      baseValue === 0 && !Number(baseValue) ? '' : baseValue
                    }
                    onChange={(e) =>
                      setBaseValue(
                        e.target.value === '' ? '' : Number(e.target.value),
                      )
                    }
                    className='h-11 rounded-[12px]'
                  />
                  <Label className='text-xs font-normal leading-tight text-secondary'>
                    Base value stands for the value of the metric before using
                    Measurely to measure the metric
                  </Label>
                </div>
              </div>

              {namingType === 'auto' ? (
                <></>
              ) : (
                <>
                  <Separator className='my-2' />
                  <div className='flex w-full flex-col gap-3'>
                    <Label>Positive variable name</Label>
                    <Input
                      placeholder='Account created, transfer sent'
                      type='text'
                      className='h-11 rounded-[12px]'
                      value={namePos}
                      onChange={(e) => {
                        setNamePos(e.target.value.trimStart());
                      }}
                    />
                  </div>

                  <div className='flex w-full flex-col gap-3'>
                    <Label>Negative variable name</Label>
                    <Input
                      placeholder='Account deleted, transfer kept'
                      type='text'
                      className='h-11 rounded-[12px]'
                      value={nameNeg}
                      onChange={(e) => {
                        setNameNeg(e.target.value.trimStart());
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* <div className='flex w-full flex-row gap-2 max-md:flex-col'>
            <Button
              type='button'
              variant='secondary'
              className='w-full rounded-[12px]'
              onClick={() => props.setStep(1)}
            >
              Back
            </Button>
            <Button
              type='submit'
              variant='default'
              loading={loading}
              disabled={
                loading || name === '' || namePos === '' || nameNeg === ''
              }
              className='w-full rounded-[12px]'
            >
              Create
            </Button>
          </div> */}
        </div>
      </form>
    </div>
  );
}

function StripeStep(props: { setStep: Dispatch<SetStateAction<number>> }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { projects, activeProject } = useContext(ProjectsContext);

  return (
    <div className='mx-auto flex flex-col gap-6'>
      <div className='flex flex-col gap-[5px]'>
        <div className='text-xl font-medium'>Stripe Metric</div>
        <div className='text-sm text-secondary'>
          Tracks revenue, subscriptions, refunds, and more via Stripe for
          financial insights.
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            if (name === '') {
              toast.error('Please enter a name');
              setLoading(false);
              return;
            }

            if (forbidden.includes(name.toLowerCase())) {
              toast.error(
                'The variable names you have chosen are used internally, please choose something else.',
              );
              setLoading(false);
              return;
            }

            const response = await fetch(
              process.env.NEXT_PUBLIC_API_URL + '/metric',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                  name: name,
                  project_id: projects[activeProject].id,
                  base_value: 0,
                  type: MetricType.Stripe,
                  name_pos: 'income',
                  nameneg: 'outcome',
                }),
              },
            );

            if (response.ok) {
              const data = await response.json();

              fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/stripe`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  project_id: data.projectid,
                  metric_id: data.id,
                }),
              })
                .then((res) => {
                  if (res.ok) {
                    return res.json();
                  } else {
                    res.text().then((text) => {
                      toast.error(text);
                      setLoading(false);
                    });
                  }
                })
                .then((data) => {
                  if (data !== undefined && data !== null) {
                    window.location.replace(data.url);
                  }
                });
            } else {
              response.text().then((text) => {
                toast.error(text);
                setLoading(false);
              });
            }
          }}
        >
          <div className='flex w-full flex-col gap-3'>
            <div className='my-2 flex flex-col gap-4'>
              <div className='flex w-full flex-col gap-3'>
                <Label>Metric name</Label>
                <Input
                  placeholder={'Revenue, Earnings, Sales, Profit'}
                  type='text'
                  maxLength={30}
                  className='h-11 rounded-[12px]'
                  value={name}
                  onChange={(e) => setName(e.target.value.trimStart())}
                />
              </div>
            </div>
          </div>
          {/* 
          <div className='flex w-full flex-row gap-2 max-md:flex-col'>
            <Button
              type='button'
              variant='secondary'
              className='w-full rounded-[12px]'
              onClick={() => props.setStep(1)}
            >
              Back
            </Button>
            <Button
              type='submit'
              variant='default'
              loading={loading}
              disabled={name === '' || loading}
              className='w-full rounded-[12px]'
            >
              Create
            </Button>
          </div> */}
        </form>
      </div>
    </div>
  );
}
