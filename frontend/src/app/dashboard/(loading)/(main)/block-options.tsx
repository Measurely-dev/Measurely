'use client';

import {
  ChangeEvent,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useContext } from 'react';
import { ProjectsContext } from '@/dash-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Block,
  BlockType,
  ChartType,
  chartTypeMetricLimits,
  Metric,
  Project,
} from '@/types';
import { toast } from 'sonner';
import { useConfirm } from '@omit/react-confirm-dialog';
import { LabelSelect } from '@/components/ui/label-select';
import { Input } from '@/components/ui/input';
import { MetricSelect } from '@/components/ui/metric-select';
import ColorDropdown from '@/components/ui/color-dropdown';
import { FilterCategorySelect } from '@/components/ui/filter-category-select';
import { Label } from '@/components/ui/label';

const RenameConfirmContent: FC<{
  onValueChange: (disabled: boolean, newValue: string) => void;
  initialValue: string;
}> = ({ onValueChange, initialValue }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    onValueChange(value.trim() === '' || value === initialValue, value);
  }, [value, onValueChange, initialValue]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <div className='space-y-2'>
      <p className='mt-2 text-sm font-medium'>New name</p>
      <Input
        value={value}
        onChange={handleInputChange}
        maxLength={25}
        placeholder='New name'
        autoComplete='off'
        className='h-11 rounded-[12px]'
      />
    </div>
  );
};

const getRenameConfig = (
  initialValue: string,
  onValueChange: (disabled: boolean, newValue: string) => void,
) => ({
  icon: <Edit className='size-4 text-primary' />,
  title: 'Rename Item',
  alertDialogTitle: {
    className: 'flex items-center gap-2',
  },
  description: 'Provide a new name for the selected item.',
  contentSlot: (
    <RenameConfirmContent
      onValueChange={onValueChange}
      initialValue={initialValue}
    />
  ),
  confirmText: 'Rename',
  cancelText: 'Cancel',
  confirmButton: {
    variant: 'default' as const,
    className: 'w-full sm:w-auto rounded-[12px]',
  },
  cancelButton: {
    variant: 'outline' as const,
    className: 'w-full sm:w-auto rounded-[12px]',
  },
  alertDialogContent: {
    className: 'max-w-xl !rounded-[16px]',
  },
});

const ChangeLabelDialogContent: FC<{
  onLabelChange: (newLabel: string) => void;
  initialLabel: string;
}> = ({ onLabelChange, initialLabel }) => {
  const [label, setLabel] = useState(initialLabel);

  const handleLabelSelectChange: React.Dispatch<
    React.SetStateAction<string>
  > = (newSelectedLabel) => {
    setLabel(newSelectedLabel);
  };

  useEffect(() => {
    setLabel(initialLabel);
  }, [initialLabel]);

  useEffect(() => {
    onLabelChange(label.trim() === '' || label === initialLabel ? '' : label);
  }, [label, onLabelChange, initialLabel]);

  return (
    <div className='space-y-4'>
      <p className='text-sm font-medium'>Edit Label</p>
      <LabelSelect
        selectedLabel={label}
        setSelectedLabel={handleLabelSelectChange}
      />
    </div>
  );
};
const MetricDialogContent: FC<{
  selectedMetrics: Metric[];
  setSelectedMetrics: React.Dispatch<React.SetStateAction<Metric[]>>;
  selectFilterCategories: string;
  setSelectFilterCategories: Dispatch<SetStateAction<string>>;
  chartType: ChartType | undefined;
  isNested: boolean;
}> = ({
  selectedMetrics,
  setSelectedMetrics,
  selectFilterCategories,
  setSelectFilterCategories,
  chartType,
  isNested,
}) => {
  const chartLimits =
    chartType !== undefined
      ? chartTypeMetricLimits[chartType]
      : chartTypeMetricLimits[ChartType.Area];

  const min = chartLimits.min;
  const max = chartLimits.max;

  return (
    <div className='space-y-4'>
      <p className='text-sm font-medium'>
        {`Select ${selectedMetrics.length} of ${max} metrics`}
        <span
          className={`ml-2 ${
            selectedMetrics.length < min || selectedMetrics.length > max
              ? 'text-red-500'
              : 'text-green-500'
          }`}
        >
          {selectedMetrics.length < min
            ? `(${min - selectedMetrics.length} more required)`
            : selectedMetrics.length > max
              ? `(${selectedMetrics.length - max} too many)`
              : ''}
        </span>
      </p>
      <MetricSelect
        min={min}
        max={max}
        selectedMetrics={selectedMetrics}
        setSelectFilterCategories={setSelectFilterCategories}
        setSelectedMetrics={setSelectedMetrics}
      />
      {isNested &&
        selectedMetrics.length > 0 &&
        Object.keys(selectedMetrics[0].filters || {}).length > 0 && (
          <div className='flex flex-col gap-2'>
            <Label>Select filter category</Label>
            <FilterCategorySelect
              metric={selectedMetrics[0]}
              selectedFilterCategory={selectFilterCategories}
              setSelectedFilterCategory={setSelectFilterCategories}
            />
          </div>
        )}
    </div>
  );
};

export default function BlockOptions(
  props: Block & {
    children: ReactNode;
    setIsOpen: (state: boolean) => void;
    groupkey?: string;
  },
) {
  const confirm = useConfirm();
  const { projects, setProjects, activeProject } = useContext(ProjectsContext);
  const [newName, setNewName] = useState(props.name);
  const [isRenamed, setIsRenamed] = useState(false);
  const [isLabelChanged, setIsLabelChanged] = useState(false);
  const [newLabel, setNewLabel] = useState(props.label);
  const [newMetrics, setNewMetrics] = useState<Metric[]>([]);
  const [isMetricChanged, setIsMetricChanged] = useState(false);
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);
  const [isMetricDialogOpen, setIsMetricDialogOpen] = useState(false);
  const [selectFilterCategory, setSelectFilterCategory] = useState<string>(
    props.filter_categories[0] ?? '',
  );

  useEffect(() => {
    setNewMetrics(
      props.metric_ids
        .map((id) =>
          projects[activeProject]?.metrics?.find((metric) => metric.id === id),
        )
        .filter((metric): metric is Metric => metric !== undefined),
    );
  }, [props.metric_ids, projects, activeProject]);

  async function handleDelete() {
    const isConfirmed = await confirm({
      title: `Delete ${props.type === BlockType.Group ? 'Group' : 'Block'}`,
      icon: <Trash2 className='size-5 text-destructive' />,
      description: `Are you sure you want to delete this ${
        props.type === BlockType.Group ? 'Group' : 'Block'
      }? This action cannot be undone.`,
      confirmText: 'Yes, delete',
      cancelText: 'Cancel',
      cancelButton: {
        size: 'default',
        variant: 'outline',
        className: 'rounded-[12px]',
      },
      confirmButton: {
        className: 'bg-red-500 hover:bg-red-600 text-white rounded-[12px]',
      },
      alertDialogTitle: {
        className: 'flex items-center gap-2',
      },
      alertDialogContent: {
        className: '!rounded-[16px]',
      },
    });
    if (isConfirmed) {
      let layout = projects[activeProject].blocks?.layout;
      if (props.groupkey !== undefined) {
        const blockIndex =
          layout?.findIndex((l) => l.unique_key === props.groupkey) ?? -1;
        if (blockIndex === -1) return;

        let nested = layout?.[blockIndex].nested ?? [];
        nested = nested.filter((n) => n.unique_key !== props.unique_key);
        for (let i = 0; i < nested.length; i++) {
          nested[i].id = i + 1;
        }

        setProjects(
          projects.map((proj, i) =>
            i === activeProject
              ? {
                  ...proj,
                  blocks: {
                    ...proj.blocks,
                    layout: proj.blocks?.layout.map((l) =>
                      l.unique_key === props.groupkey
                        ? {
                            ...l,
                            nested,
                          }
                        : l,
                    ),
                    userid: proj.blocks?.user_id || '',
                  },
                }
              : proj,
          ) as Project[],
        );
      } else {
        layout = layout?.filter((l) => l.unique_key !== props.unique_key) ?? [];
        for (let i = 0; i < layout.length; i++) {
          layout[i].id = i + 1;
        }

        setProjects(
          projects.map((proj, i) =>
            i === activeProject
              ? {
                  ...proj,
                  blocks: {
                    ...proj.blocks,
                    layout,
                    userid: proj.blocks?.user_id || '',
                  },
                }
              : proj,
          ) as Project[],
        );
      }
      toast.success(
        `${
          props.type === BlockType.Group ? 'Group' : 'Block'
        } deleted successfully.`,
      );
    }
  }

  async function handleMetricChange() {
    const metrics = props.metric_ids
      .map((id) =>
        projects[activeProject]?.metrics?.find((metric) => metric.id === id),
      )
      .filter((metric): metric is Metric => metric !== undefined);

    if (metrics.length === 0) {
      toast.error('No valid metrics found.');
      return;
    }

    setNewMetrics(metrics);
    setIsMetricDialogOpen(true);
  }

  const handleLabelChange = async () => {
    setNewLabel(props.label);
    setIsLabelDialogOpen(true);
  };

  async function handleRename() {
    const confirmConfig = getRenameConfig(props.name, (disabled, newValue) => {
      setNewName(newValue);
      confirm.updateConfig((prev) => ({
        ...prev,
        confirmButton: { ...prev.confirmButton, disabled },
      }));
    });

    const isConfirmed = await confirm(confirmConfig);

    if (isConfirmed) {
      setIsRenamed(true);
    }
  }

  useEffect(() => {
    if (isRenamed && projects[activeProject]) {
      setProjects(
        projects.map((proj, i) =>
          i === activeProject
            ? {
                ...proj,
                blocks: {
                  ...proj.blocks,
                  layout: proj.blocks?.layout.map((l) =>
                    props.groupkey
                      ? l.unique_key === props.groupkey
                        ? {
                            ...l,
                            nested: l.nested?.map((n) =>
                              n.unique_key === props.unique_key
                                ? { ...n, name: newName }
                                : n,
                            ),
                          }
                        : l
                      : l.unique_key === props.unique_key
                        ? { ...l, name: newName }
                        : l,
                  ),
                  userid: proj.blocks?.user_id || '',
                },
              }
            : proj,
        ) as Project[],
      );

      toast.success(
        `${
          props.type === BlockType.Group ? 'Group' : 'Block'
        } renamed successfully to "${newName}".`,
      );
      setIsRenamed(false);
    }

    if (isLabelChanged && projects[activeProject]) {
      setProjects(
        projects.map((proj, i) =>
          i === activeProject
            ? {
                ...proj,
                blocks: {
                  ...proj.blocks,
                  layout: proj.blocks?.layout.map((l) =>
                    l.unique_key === props.unique_key
                      ? { ...l, label: newLabel }
                      : l,
                  ),
                  userid: proj.blocks?.user_id || '',
                },
              }
            : proj,
        ) as Project[],
      );

      toast.success(`Label updated successfully to "${newLabel}".`);
      setIsLabelChanged(false);
    }
  }, [isRenamed, newName, isLabelChanged, newLabel, projects, activeProject]);

  useEffect(() => {
    if (isMetricChanged && projects[activeProject]) {
      setProjects(
        projects.map((proj, i) =>
          i === activeProject
            ? {
                ...proj,
                blocks: {
                  ...proj.blocks,
                  layout: proj.blocks?.layout.map((l) =>
                    props.groupkey
                      ? l.unique_key === props.groupkey
                        ? {
                            ...l,
                            nested: l.nested?.map((n) =>
                              n.unique_key === props.unique_key
                                ? {
                                    ...n,
                                    metric_ids: newMetrics.map(
                                      (metric) => metric.id,
                                    ),
                                    filtercategories: [selectFilterCategory],
                                  }
                                : n,
                            ),
                          }
                        : l
                      : l.unique_key === props.unique_key
                        ? {
                            ...l,
                            metric_ids: newMetrics.map((metric) => metric.id),
                            filtercategories: [selectFilterCategory],
                          }
                        : l,
                  ),
                  userid: proj.blocks?.user_id || '',
                },
              }
            : proj,
        ) as Project[],
      );

      toast.success(`Metrics updated successfully.`);
      setIsMetricChanged(false);
    }
  }, [
    isMetricChanged,
    newMetrics,
    selectFilterCategory,
    projects,
    activeProject,
  ]);

  function handleColor(newcolor: string) {
    setProjects(
      projects.map((proj, i) =>
        i === activeProject
          ? {
              ...proj,
              blocks: {
                ...proj.blocks,
                layout: proj.blocks?.layout.map((l) =>
                  props.groupkey
                    ? l.unique_key === props.groupkey
                      ? {
                          ...l,
                          nested: l.nested?.map((n) =>
                            n.unique_key === props.unique_key
                              ? { ...n, color: newcolor }
                              : n,
                          ),
                        }
                      : l
                    : l.unique_key === props.unique_key
                      ? { ...l, color: newcolor }
                      : l,
                ),
                userid: proj.blocks?.user_id || '',
              },
            }
          : proj,
      ) as Project[],
    );
  }

  return (
    <>
      <DropdownMenu onOpenChange={(e) => props.setIsOpen(e)}>
        <DropdownMenuTrigger asChild>{props.children}</DropdownMenuTrigger>
        <DropdownMenuContent className='mr-8 w-56 rounded-[12px] shadow-md'>
          {props.type === BlockType.Group ? (
            <DropdownMenuLabel>Group Options</DropdownMenuLabel>
          ) : (
            <DropdownMenuLabel>Block Options</DropdownMenuLabel>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => handleRename()}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLabelChange}
              className={props.type === BlockType.Group ? 'hidden' : ''}
            >
              Edit Label
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleMetricChange}
              className={props.type === BlockType.Group ? 'hidden' : ''}
            >
              {props.type !== BlockType.Nested
                ? 'Edit Metric(s)'
                : 'Edit Metric(s) & Filter'}
            </DropdownMenuItem>
            <div className={props.type === BlockType.Group ? 'hidden' : ''}>
              <ColorDropdown color={props.color} updateColor={handleColor} />
            </div>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={handleDelete}
              className='hover:!text-destructive'
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isLabelDialogOpen} onOpenChange={setIsLabelDialogOpen}>
        <DialogContent className='max-w-xl !rounded-[16px]'>
          <DialogHeader>
            <DialogTitle>Change Label</DialogTitle>
            <DialogDescription>
              Update the label for the selected item.
            </DialogDescription>
          </DialogHeader>
          <ChangeLabelDialogContent
            onLabelChange={(label) => {
              setNewLabel(label);
            }}
            initialLabel={props.label}
          />
          <DialogFooter>
            <Button
              variant='secondary'
              className='rounded-[12px]'
              onClick={() => setIsLabelDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className='rounded-[12px]'
              onClick={() => {
                setIsLabelDialogOpen(false);
                setIsLabelChanged(true);
              }}
              disabled={newLabel.trim() === ''}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isMetricDialogOpen} onOpenChange={setIsMetricDialogOpen}>
        <DialogContent className='max-w-xl !rounded-[16px]'>
          <DialogHeader>
            <DialogTitle>
              {props.type !== BlockType.Nested
                ? 'Edit Metric(s)'
                : 'Edit Metric(s) & Filter'}
            </DialogTitle>
            <DialogDescription>
              Update the metrics for the selected item.
            </DialogDescription>
          </DialogHeader>
          <MetricDialogContent
            selectedMetrics={newMetrics}
            setSelectedMetrics={setNewMetrics}
            selectFilterCategories={selectFilterCategory}
            setSelectFilterCategories={setSelectFilterCategory}
            chartType={props.chart_type}
            isNested={props.type === BlockType.Nested}
          />
          <DialogFooter>
            <Button
              variant='secondary'
              className='rounded-[12px]'
              onClick={() => setIsMetricDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className='rounded-[12px]'
              onClick={() => {
                setIsMetricDialogOpen(false);
                setIsMetricChanged(true);
              }}
              disabled={
                newMetrics.length === 0 ||
                (props.type === BlockType.Nested && selectFilterCategory === '')
              }
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
