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
import { AppsContext } from '@/dash-context';
import { MetricType } from '@/types';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useContext, useState } from 'react';
import { toast } from 'sonner';

export default function NewMetric() {
  const [step, setStep] = useState(1);
  const [value, setValue] = useState<number>(0);

  const metricTypes = [
    {
      name: 'Basic metric',
      value: MetricType.Base,
      description:
        'Tracks a single, always-positive variable, perfect for monitoring growth, like total active users or daily logins.',
    },
    {
      name: 'Dual Variable Metric',
      value: MetricType.Dual,
      description:
        'This metric compares two opposing variables, allowing you to track both positive and negative influences on a key metric. For example, monitor user activity by measuring new account creations versus deletions, giving you a clear view of net growth or decline.',
    },
    {
      name: 'Average metric (Coming soon)',
      value: 2,
      description:
        'An average metric tracks the average value of data over time, like session durations, revealing trends and typical performance.',
    },
  ];

  const renderStep = () => {
    switch (value) {
      case MetricType.Base:
        return <BasicStep setStep={setStep} />;
      case MetricType.Dual:
        return <DualStep setStep={setStep} />;
    }
  };

  return (
    <div className='flex flex-col'>
      <WebContainer className='h-[100vh] min-h-[700px] w-[100vw]'>
        <AuthNavbar href='/dashboard' button='Dashboard' />
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
                <div className='flex w-full flex-col gap-2'>
                  {metricTypes.map((metric, i) => {
                    return (
                      <Metric
                        descripiton={metric.description}
                        name={metric.name}
                        key={i}
                        value={metric.value}
                        state={value}
                        setState={setValue}
                      />
                    );
                  })}
                </div>
                {/* Next btn */}
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
      <Footer border bg='secondary' />
    </div>
  );
}

function Metric(props: {
  name: string;
  value: number;
  descripiton: string;
  state: any;
  setState: Dispatch<SetStateAction<number>>;
}) {
  return (
    <div
      className={`flex w-full select-none flex-col gap-1 rounded-xl border p-3 transition-all duration-150 ${props.value === 2 ? 'cursor-not-allowed !bg-accent' : ''} ${
        props.state === props.value
          ? 'cursor-pointer bg-blue-500/5 ring-2 ring-blue-500'
          : 'cursor-pointer hover:bg-accent/50'
      }`}
      onClick={() => {
        if (props.value === 2) {
          return;
        }
        props.setState(props.value);
      }}
    >
      <div className='text-sm font-medium'>{props.name}</div>
      <div className='text-xs font-light text-secondary'>
        {props.descripiton}
      </div>
    </div>
  );
}

function BasicStep(props: { setStep: Dispatch<SetStateAction<number>> }) {
  const [name, setName] = useState('');
  const [baseValue, setBaseValue] = useState<number | string>(0);
  const [loading, setLoading] = useState(false);
  const { applications, setApplications, activeApp } = useContext(AppsContext);
  const router = useRouter();

  return (
    <div className='mx-auto flex flex-col gap-6'>
      <div className='flex flex-col gap-[5px]'>
        <div className='text-xl font-medium'>Basic metric</div>
        <div className='text-sm text-secondary'>
          Track a single value for straightforward metrics, ideal for simple
          counts or totals.
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

            if (
              name.toLowerCase() === 'total' ||
              name.toLowerCase() === 'positive trend' ||
              name.toLowerCase() === 'negative trend'
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
                appid: applications[activeApp].id,
                basevalue: baseValue,
                type: MetricType.Base,
                namepos: '',
                nameneg: '',
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
                setApplications(
                  applications.map((v, i) =>
                    i === activeApp
                      ? Object.assign({}, v, {
                          metrics: [
                            ...(applications[activeApp].metrics ?? []),
                            json,
                          ],
                        })
                      : v,
                  ),
                );

                toast.success('Metric was succesfully created');
                router.push('/dashboard/metrics');
              });
          }}
        >
          <div className='flex w-full flex-col gap-3'>
            <div className='my-2 flex flex-col gap-4'>
              <div className='flex w-full flex-col gap-3'>
                <Label>Metric name</Label>
                <Input
                  placeholder='New users, Deleted projects, Suspended accounts'
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

  const { applications, setApplications, activeApp } = useContext(AppsContext);
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
            namePos.toLowerCase() === 'total' ||
            nameNeg.toLowerCase() === 'total' ||
            namePos.toLowerCase() === 'positive trend' ||
            nameNeg.toLowerCase() === 'positive trend' ||
            namePos.toLowerCase() === 'negative trend' ||
            nameNeg.toLowerCase() === 'negative trend'
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
              appid: applications[activeApp].id,
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
                applications[activeApp].metrics === null
              ) {
                return;
              }

              setApplications(
                applications.map((v, i) =>
                  i === activeApp
                    ? Object.assign({}, v, {
                        metrics: [
                          ...(applications[activeApp].metrics ?? []),
                          json,
                        ],
                      })
                    : v,
                ),
              );

              toast.success('Metric was succesfully created');
              router.push('/dashboard/metrics');
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
                  placeholder='Users, Transfers, Applications'
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
