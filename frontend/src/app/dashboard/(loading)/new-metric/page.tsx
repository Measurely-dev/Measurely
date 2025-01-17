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
            'Integrates with Stripe to track payment-related metrics such as revenue, subscriptions, customer churn, and transaction volume. Useful for monitoring business performance and growth through financial data.',
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
    }
  };

  const isComingSoon = (type: MetricType) => {
    return type === MetricType.Google || type === MetricType.AWS;
  };

  useEffect(() => {
    if (
      projects[activeProject].userrole !== UserRole.Admin &&
      projects[activeProject].userrole !== UserRole.Owner
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
          {step === 1 ? (
            <>
              <div className='mx-auto flex w-full max-w-[500px] flex-col gap-6'>
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
                  <TabsList className='mb-0 grid w-full grid-cols-2 border-0'>
                    <TabsTrigger value='metrics'>Metrics</TabsTrigger>
                    <TabsTrigger value='integrations'>Integrations</TabsTrigger>
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
                <Button
                  className='w-full rounded-[12px]'
                  onClick={() => setStep(2)}
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <div className='h-fit w-full max-w-[500px]'>{renderStep()}</div>
          )}
        </ContentContainer>
      </WebContainer>
      <Footer type='waitlist' border bg='secondary' isHome />
    </div>
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
                projectid: projects[activeProject].id,
                basevalue: baseValue,
                type: props.type,
                namepos: 'added',
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
          </div>
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
              projectid: projects[activeProject].id,
              basevalue: baseValue,
              type: MetricType.Dual,
              namepos: namePos,
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
              disabled={
                loading || name === '' || namePos === '' || nameNeg === ''
              }
              className='w-full rounded-[12px]'
            >
              Create
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
