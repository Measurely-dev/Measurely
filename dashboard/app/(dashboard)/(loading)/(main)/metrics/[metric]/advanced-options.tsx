// Import UI components and types
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ChartColors, DualMetricChartColors, MetricType } from '@/types';
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from 'react';

/**
 * AdvancedOptions component provides chart customization controls
 * Allows users to modify chart type, colors and trend line display
 */
function AdvancedOptions(props: {
  chartName: string;
  metricId: string;
  metricType: MetricType;
  children: ReactNode;
  chartType: string;
  chartColor: string;
  dualMetricChartColor?: string;
  splitTrendChecked?: boolean;
  setChartType: Dispatch<SetStateAction<'stacked' | 'percent' | 'default'>>;
  setChartColor: Dispatch<SetStateAction<keyof ChartColors>>;
  setDualMetricChartColor?: Dispatch<
    SetStateAction<keyof DualMetricChartColors>
  >;
  setSplitTrendChecked?: Dispatch<SetStateAction<boolean>>;
}) {
  // Controls popover open state
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Load saved chart settings from localStorage on mount
  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('chartsettings') ?? '{}');
    let name = props.metricId + props.chartName;
    if (props.chartName === 'trend' && props.splitTrendChecked) {
      name += 'dual';
    }
    if (!settings[name]) return;

    // Apply saved chart type if exists
    if (settings[name].chartType) {
      props.setChartType(
        settings[name].chartType as 'stacked' | 'percent' | 'default',
      );
    }

    // Apply saved color settings
    if (settings[name].chartColor) {
      if (props.dualMetricChartColor && props.setDualMetricChartColor) {
        props.setDualMetricChartColor(
          settings[name].chartColor as keyof DualMetricChartColors,
        );
      } else {
        props.setChartColor(settings[name].chartColor as keyof ChartColors);
      }
    }
  }, [props.splitTrendChecked]);

  // Save chart settings to localStorage when they change
  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('chartsettings') ?? '{}');
    let name = props.metricId + props.chartName;
    if (props.chartName === 'trend' && props.splitTrendChecked) {
      name += 'dual';
    }
    if (!settings[name])
      settings[name] = {
        chartType: undefined,
        chartColor: undefined,
      };

    settings[name].chartType = props.chartType;

    if (props.dualMetricChartColor && props.setDualMetricChartColor) {
      settings[name].chartColor = props.dualMetricChartColor;
    } else {
      settings[name].chartColor = props.chartColor;
    }

    localStorage.setItem('chartsettings', JSON.stringify(settings));
  }, [
    props.chartType,
    props.chartColor,
    props.dualMetricChartColor,
    props.splitTrendChecked,
  ]);

  return (
    <Popover open={isOpen} onOpenChange={(e) => setIsOpen(e)}>
      <PopoverTrigger asChild>{props.children}</PopoverTrigger>
      <PopoverContent className='rounded-[12px] max-sm:px-2'>
        <div className='flex w-full flex-col gap-4'>
          {/* Chart type selector for dual metrics */}
          {props.metricType === MetricType.Dual &&
          props.chartName !== 'trend' ? (
            <Label className='flex flex-col gap-2'>
              Chart type
              <Select
                value={props.chartType}
                onValueChange={(e) => {
                  props.setChartType(e as 'stacked' | 'percent' | 'default');
                  setIsOpen(false);
                }}
              >
                <SelectTrigger className='h-11 border'>
                  <SelectValue placeholder='Select chart type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={'default'}>Default</SelectItem>
                    <SelectItem value={'stacked'}>Stacked</SelectItem>
                    <SelectItem value={'percent'}>Percentage</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Label>
          ) : (
            <></>
          )}

          {/* Dual metric color selector */}
          {(props.metricType === MetricType.Dual &&
            props.chartName !== 'trend') ||
          (props.chartName === 'trend' && props.splitTrendChecked) ? (
            <Label className='flex flex-col gap-2'>
              Chart color
              <Select
                value={props.dualMetricChartColor}
                onValueChange={(e) => {
                  if (props.setDualMetricChartColor !== undefined) {
                    props.setDualMetricChartColor(
                      e as keyof DualMetricChartColors,
                    );
                  }
                  setIsOpen(false);
                }}
              >
                <SelectTrigger className='h-11 border'>
                  <SelectValue placeholder='Select chart color' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value='default'>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='flex gap-1'>
                          <div className='size-2 rounded-full bg-green-500' />
                          <div className='size-2 rounded-full bg-red-500' />
                        </div>
                        Default
                      </div>
                    </SelectItem>

                    <SelectItem value='cool'>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='flex gap-1'>
                          <div className='size-2 rounded-full bg-cyan-500' />
                          <div className='size-2 rounded-full bg-violet-500' />
                        </div>
                        Cool
                      </div>
                    </SelectItem>

                    <SelectItem value='warm'>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='flex gap-1'>
                          <div className='size-2 rounded-full bg-fuchsia-400' />
                          <div className='size-2 rounded-full bg-red-500' />
                        </div>
                        Warm
                      </div>
                    </SelectItem>

                    <SelectItem value='contrast'>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='flex gap-1'>
                          <div className='size-2 rounded-full bg-lime-500' />
                          <div className='size-2 rounded-full bg-gray-500' />
                        </div>
                        Contrast
                      </div>
                    </SelectItem>

                    <SelectItem value='soft'>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='flex gap-1'>
                          <div className='size-2 rounded-full bg-pink-400' />
                          <div className='size-2 rounded-full bg-gray-500' />
                        </div>
                        Soft
                      </div>
                    </SelectItem>

                    <SelectItem value='vibrant'>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='flex gap-1'>
                          <div className='size-2 rounded-full bg-fuchsia-400' />
                          <div className='size-2 rounded-full bg-blue-500' />
                        </div>
                        Vibrant
                      </div>
                    </SelectItem>

                    <SelectItem value='neutral'>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='flex gap-1'>
                          <div className='size-2 rounded-full bg-gray-500' />
                          <div className='size-2 rounded-full bg-gray-500' />
                        </div>
                        Neutral
                      </div>
                    </SelectItem>
                    <SelectItem value='pastel'>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='flex gap-1'>
                          <div className='size-2 rounded-full bg-rose-400' />
                          <div className='size-2 rounded-full bg-teal-500' />
                        </div>
                        Pastel
                      </div>
                    </SelectItem>

                    <SelectItem value='sunset'>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='flex gap-1'>
                          <div className='size-2 rounded-full bg-orange-500' />
                          <div className='size-2 rounded-full bg-violet-500' />
                        </div>
                        Sunset
                      </div>
                    </SelectItem>

                    <SelectItem value='ocean'>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='flex gap-1'>
                          <div className='size-2 rounded-full bg-emerald-500' />
                          <div className='size-2 rounded-full bg-sky-500' />
                        </div>
                        Ocean
                      </div>
                    </SelectItem>

                    <SelectItem value='forest'>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='flex gap-1'>
                          <div className='size-2 rounded-full bg-green-500' />
                          <div className='size-2 rounded-full bg-yellow-500' />
                        </div>
                        Forest
                      </div>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Label>
          ) : (
            <Label className='flex flex-col gap-2'>
              Chart color
              <Select
                value={props.chartColor}
                onValueChange={(e) => {
                  props.setChartColor(e as keyof ChartColors);
                  setIsOpen(false);
                }}
              >
                <SelectTrigger className='h-11 border'>
                  <SelectValue placeholder='Select chart color' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={'blue'}>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='size-2 rounded-full bg-blue-500' />
                        Blue
                      </div>
                    </SelectItem>
                    <SelectItem value={'red'}>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='size-2 rounded-full bg-red-500' />
                        Red
                      </div>
                    </SelectItem>
                    <SelectItem value={'green'}>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='size-2 rounded-full bg-green-400' />
                        Green
                      </div>
                    </SelectItem>
                    <SelectItem value={'pink'}>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='size-2 rounded-full bg-pink-400' />
                        Pink
                      </div>
                    </SelectItem>
                    <SelectItem value={'fuchsia'}>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='size-2 rounded-full bg-fuchsia-400' />
                        Fuchsia
                      </div>
                    </SelectItem>
                    <SelectItem value={'gray'}>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='size-2 rounded-full bg-zinc-400' />
                        Gray
                      </div>
                    </SelectItem>
                    <SelectItem value={'cyan'}>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='size-2 rounded-full bg-cyan-500' />
                        Cyan
                      </div>
                    </SelectItem>
                    <SelectItem value={'violet'}>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='size-2 rounded-full bg-violet-500' />
                        Violet
                      </div>
                    </SelectItem>
                    <SelectItem value={'lime'}>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='size-2 rounded-full bg-lime-500' />
                        Lime
                      </div>
                    </SelectItem>
                    <SelectItem value={'yellow'}>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='size-2 rounded-full bg-yellow-500' />
                        Yellow
                      </div>
                    </SelectItem>
                    <SelectItem value={'orange'}>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='size-2 rounded-full bg-orange-500' />
                        Orange
                      </div>
                    </SelectItem>
                    <SelectItem value={'teal'}>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='size-2 rounded-full bg-teal-500' />
                        Teal
                      </div>
                    </SelectItem>
                    <SelectItem value={'amber'}>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='size-2 rounded-full bg-amber-500' />
                        Amber
                      </div>
                    </SelectItem>
                    <SelectItem value={'indigo'}>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='size-2 rounded-full bg-indigo-500' />
                        Indigo
                      </div>
                    </SelectItem>
                    <SelectItem value={'rose'}>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='size-2 rounded-full bg-rose-500' />
                        Rose
                      </div>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Label>
          )}

          {/* Split trend lines toggle for dual metrics */}
          {props.chartName === 'trend' &&
          props.metricType === MetricType.Dual ? (
            <Label className='flex flex-row items-center justify-between gap-4'>
              <div className='flex flex-col gap-1'>
                Split trend lines
                <div className='text-xs font-normal text-muted-foreground'>
                  Divide trend into separate positive and negative values
                </div>
              </div>
              <Switch
                checked={props.splitTrendChecked}
                onCheckedChange={(e) => {
                  if (props.setSplitTrendChecked) {
                    props.setSplitTrendChecked(e);
                  }
                }}
              />
            </Label>
          ) : (
            <></>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default AdvancedOptions;
