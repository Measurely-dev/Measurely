'use client';
import {
  Accordion,
  AccordionItem,
  AccordionContent,
} from '@/components/ui/accordion-base';
import {
  Edit2,
  MoreHorizontal,
  Plus,
  PlusCircle,
  PlusSquare,
  Tag,
  Trash2,
} from 'lucide-react';
import { useContext, useState } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useConfirm } from '@omit/react-confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { TagInput } from 'emblor';
import { Metric } from '@/types';
import { toast } from 'sonner';
import { ProjectsContext } from '@/dash-context';

export default function FilterManagerDialog(props: {
  open: boolean;
  setOpen: (state: boolean) => void;
  metric: Metric;
}) {
  const [activeAccordion, setActiveAccordion] = useState<string | undefined>();
  const [renameDialogOpen, setRenameDialogOpen] = useState<boolean>(false);
  const [categoryToRename, setCategoryToRename] = useState<
    string | undefined
  >();
  const [parentCategory, setParentCategory] = useState<string>('');
  const [renameInputValue, setRenameInputValue] = useState<string>('');
  const [creationDialogOpen, setCreationDialogOpen] = useState<boolean>(false);
  const [creationType, setCreationType] = useState<'filter' | 'category'>(
    'category',
  );
  const [creationInputValue, setCreationInputValue] = useState<string>('');
  const [badgeDialogOpen, setBadgeDialogOpen] = useState<boolean>(false);
  const [filterToEdit, setFilterToEdit] = useState<Metric | undefined>();
  const [filterInputValue, setFilterInputValue] = useState<string>('');
  const confirm = useConfirm();
  const [tags, setTags] = useState<any[]>([]);
  const { projects, setProjects } = useContext(ProjectsContext);

  const handleAccordionToggle = (categoryName: string) => {
    setActiveAccordion((prev) =>
      prev === categoryName ? undefined : categoryName,
    );
  };

  const handleRename = (categoryName: string) => {
    setCategoryToRename(categoryName);
    setRenameInputValue(categoryName);
    setRenameDialogOpen(true);
  };

  const handleCreate = (type: 'filter' | 'category', category?: string) => {
    setCreationType(type);
    if (category && type === 'filter') {
      setParentCategory(category);
    }
    setCreationInputValue('');
    setTags([]);
    setCreationDialogOpen(true);
  };

  const handleCloseCreationDialog = () => {
    setCreationDialogOpen(false);
    setCreationInputValue('');
    setTags([]);
  };

  const handleBadgeEdit = (filter: Metric) => {
    setFilterToEdit(filter);
    setFilterInputValue(filter.name);
    setBadgeDialogOpen(true);
  };

  const handleCreation = async () => {
    let filterTags = tags;
    let category = creationInputValue;
    if (creationType === 'filter') {
      filterTags = [
        {
          id: 0,
          text: creationInputValue,
        },
      ];

      category = parentCategory;
    }

    const tagCreationPromises = filterTags.map(
      async (tag): Promise<Metric | undefined> => {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/metric`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: tag.text,
              type: props.metric.type,
              namepos: '',
              nameneg: '',
              basevalue: 0,
              projectid: props.metric.projectid,
              parentmetricid: props.metric.id,
              filtercategory: category,
            }),
          },
        );

        if (response.ok) {
          const data = response.json();
          return data;
        }

        const error = await response.text();
        toast.error(error);
        return undefined;
      },
    );

    const results = await Promise.all(tagCreationPromises);
    const filters = props.metric.filters ?? {};

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result) {
        if (filters[result.filtercategory] === undefined) {
          filters[result.filtercategory] = [];
        }

        filters[result.filtercategory].push(result);
      }
    }

    setProjects(
      projects.map((proj) =>
        proj.id === props.metric.projectid
          ? Object.assign({}, proj, {
              metrics: proj.metrics?.map((m) =>
                m.id === props.metric.id
                  ? Object.assign({}, m, {
                      filters: filters,
                    })
                  : m,
              ),
            })
          : proj,
      ),
    );
    setActiveAccordion(category);
    handleCloseCreationDialog();
  };

  const handleBadgeDelete = async () => {
    const isConfirmed = await confirm({
      title: 'Delete Filter',
      icon: <Trash2 className='size-5 text-destructive' />,
      description:
        'Are you sure you want to delete this filter? This action cannot be undone.',
      confirmText: 'Delete',
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
      if (filterToEdit === undefined) return;
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/metric`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          metricid: filterToEdit?.id,
          projectid: props.metric.projectid,
        }),
      }).then((resp) => {
        if (resp.ok) {
          const filters = props.metric.filters;

          const newFilters = filters[filterToEdit?.filtercategory].filter(
            (m) => m.id !== filterToEdit?.id,
          );

          filters[filterToEdit.filtercategory] = newFilters;

          setProjects(
            projects.map((proj) =>
              proj.id === props.metric.id
                ? Object.assign({}, proj, {
                    metrics: proj.metrics?.map((m) =>
                      m.id === props.metric.id
                        ? Object.assign({}, m, {
                            filters: newFilters,
                          })
                        : m,
                    ),
                  })
                : proj,
            ),
          );
        } else {
          toast.error('Failed to delete filter.');
        }
      });
      setBadgeDialogOpen(false);
    }
  };

  const handleFilterCategoryDelete = async (category: string) => {
    const isConfirmed = await confirm({
      title: 'Delete Filter Category',
      icon: <Trash2 className='size-5 text-destructive' />,
      description:
        'Are you sure you want to delete this filter category? This action cannot be undone.',
      confirmText: 'Delete',
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
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/category`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectid: props.metric.projectid,
          parentmetricid: props.metric.id,
          category: category,
        }),
      }).then((resp) => {
        if (resp.ok) {
          const filters = props.metric.filters;
          delete filters[category];
          setProjects(
            projects.map((proj) =>
              proj.id === props.metric.projectid
                ? Object.assign({}, proj, {
                    metrics: proj.metrics?.map((m) =>
                      m.id === props.metric.id
                        ? Object.assign({}, m, {
                            filters: filters,
                          })
                        : m,
                    ),
                  })
                : proj,
            ),
          );
        } else {
          resp.text().then((text) => {
            toast.error(text);
          });
        }
        setBadgeDialogOpen(false);
      });
    }
  };

  const handleFilterRename = () => {
    if (filterToEdit === undefined) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/metric`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectid: props.metric.projectid,
        metricid: filterToEdit?.id,
        name: filterInputValue,
        namepos: filterToEdit.namepos,
        nameneg: filterToEdit.nameneg,
      }),
    }).then((resp) => {
      if (resp.ok) {
        const filters = props.metric.filters;

        const index = filters[filterToEdit.filtercategory].findIndex(
          (m) => m.id === filterToEdit.id,
        );
        if (index !== -1) return;
        filters[filterToEdit.filtercategory][index].name = filterInputValue;

        setProjects(
          projects.map((proj) =>
            proj.id === props.metric.projectid
              ? Object.assign({}, proj, {
                  metric: proj.metrics?.map((m) =>
                    m.id === props.metric.id
                      ? Object.assign({}, m, {
                          filters: filters,
                        })
                      : m,
                  ),
                })
              : proj,
          ),
        );
      } else {
        resp.text().then((text) => {
          toast.error(text);
        });
      }
    });

    setBadgeDialogOpen(false);
  };

  const handleFilterCategoryRename = () => {
    if (categoryToRename === undefined) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/category`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parentmetricid: props.metric.id,
        projectid: props.metric.projectid,
        newname: renameInputValue,
        oldname: categoryToRename,
      }),
    }).then((resp) => {
      if (resp.ok) {
        const filters = props.metric.filters;
        filters[renameInputValue] = props.metric.filters[categoryToRename];
        delete filters[categoryToRename];
        setProjects(
          projects.map((proj) =>
            proj.id === props.metric.projectid
              ? Object.assign({}, proj, {
                  metric: proj.metrics?.map((m) =>
                    m.id === props.metric.id
                      ? Object.assign({}, m, {
                          filters: filters,
                        })
                      : m,
                  ),
                })
              : proj,
          ),
        );
      } else {
        resp.text().then((text) => {
          toast.error(text);
        });
      }
      setRenameDialogOpen(false);
    });
  };

  return (
    <>
      <Dialog
        open={props.open}
        onOpenChange={(e) => {
          props.setOpen(e);
          setActiveAccordion(undefined);
        }}
      >
        <DialogContent className='max-h-[80vh] w-[95%] max-w-[600px] gap-0 overflow-y-auto overflow-x-visible'>
          <DialogHeader>
            <DialogTitle>Filter Manager</DialogTitle>
            <DialogDescription className='text-sm text-muted-foreground'>
              Manage and organize filters for this metric. Create new filters,
              edit existing ones.
            </DialogDescription>
          </DialogHeader>
          <Button
            className='my-5 mt-3 flex w-full items-center gap-2 rounded-[12px]'
            onClick={() => handleCreate('category')}
          >
            <Tag className='size-4' />
            Create category
          </Button>
          {Object.keys(props.metric.filters ?? {}).length === 0 ? (
            <EmptyState
              title='Create new filter category'
              description='Create a new category to organize your filters.'
              icons={[PlusCircle, Plus, PlusSquare]}
              action={{
                label: 'Create category',
                onClick: () => handleCreate('category'),
              }}
            />
          ) : (
            <>
              <div className='flex h-[60px] items-center justify-between rounded-t-[12px] border-b bg-accent px-5'>
                <div className='text-sm font-medium text-muted-foreground'>
                  Category
                </div>
                <div className='text-sm font-medium text-muted-foreground'>
                  Actions
                </div>
              </div>
              <Accordion
                className='relative'
                type='single'
                collapsible
                value={activeAccordion}
                onValueChange={setActiveAccordion}
              >
                {Object.keys(props.metric.filters ?? {}).map((category) => (
                  <>
                    <AccordionItem
                      key={category}
                      className='border-b px-5 hover:bg-accent/60'
                      value={category}
                      onClick={() => handleAccordionToggle(category)}
                    >
                      <div
                        className={`flex h-[60px] cursor-pointer select-none items-center justify-between ${activeAccordion === category ? 'text-blue-500' : ''}`}
                      >
                        <span className='font-mono !text-sm font-semibold !no-underline'>
                          {category}
                        </span>
                        <div className='flex items-center justify-center'>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant={'ghost'}
                                size={'icon'}
                                className='rounded-[12px] text-primary'
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <MoreHorizontal className='size-5' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align='end'
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <DropdownMenuItem
                                onClick={() => handleRename(category)}
                              >
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className='hover:!text-red-500'
                                onClick={() =>
                                  handleFilterCategoryDelete(category)
                                }
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <AccordionContent className='flex flex-col gap-2'>
                        <Button
                          className='mb-4 flex w-full items-center gap-2 rounded-[12px] border'
                          variant={'secondary'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreate('filter', category);
                          }}
                        >
                          <Plus className='size-4' />
                          Add filter
                        </Button>
                        <div className='grid grid-cols-3 gap-2'>
                          {props.metric.filters?.[category].map((filter) => (
                            <Badge
                              key={filter.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBadgeEdit(filter);
                              }}
                              className='group relative col-span-1 w-fit cursor-pointer select-none overflow-hidden rounded-full border border-input bg-accent/80 text-sm font-medium text-muted-foreground shadow-none transition-all duration-200 hover:bg-accent hover:pl-7 hover:text-blue-500'
                            >
                              <Edit2 className='absolute -left-4 size-4 transition-all duration-200 group-hover:left-2' />
                              {filter.name}
                            </Badge>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </>
                ))}
              </Accordion>
              <div className='flex h-[60px] items-center justify-between rounded-b-[12px] bg-accent px-5'>
                <div className='text-sm font-medium text-primary'>Total</div>
                <div className='flex size-9 items-center justify-center rounded-[12px] bg-input/60 text-sm font-medium text-primary'>
                  {Object.keys(props.metric.filters ?? {}).length}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Filter Category</DialogTitle>
            <DialogDescription>
              Update the name of this filter category to better reflect its
              purpose or content.
            </DialogDescription>
          </DialogHeader>
          <div className='flex flex-col gap-2'>
            <Label>Category Name</Label>
            <Input
              type='text'
              className='h-11 rounded-[12px]'
              placeholder='New category name...'
              value={renameInputValue}
              onChange={(e) => setRenameInputValue(e.target.value)}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button className='w-fit rounded-[12px]' variant='secondary'>
                Cancel
              </Button>
            </DialogClose>
            <Button
              className='w-fit rounded-[12px]'
              onClick={handleFilterCategoryRename}
              disabled={
                renameInputValue === categoryToRename ||
                renameInputValue.length < 2 ||
                renameInputValue.trim() === ''
              }
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={creationDialogOpen}
        onOpenChange={handleCloseCreationDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {creationType === 'category'
                ? 'Create New Category'
                : 'Create New Filter'}
            </DialogTitle>
            <DialogDescription>
              {creationType === 'category'
                ? 'Enter a name for the new filter category.'
                : 'Enter a name for the new filter.'}
            </DialogDescription>
          </DialogHeader>
          <div className='flex flex-col gap-2'>
            <Label>
              {creationType === 'category' ? 'Category Name' : 'Filter Name'}
            </Label>
            <Input
              type='text'
              className='h-11 rounded-[12px]'
              placeholder={
                creationType === 'category'
                  ? 'New category name...'
                  : 'New filter name...'
              }
              value={creationInputValue}
              onChange={(e) => setCreationInputValue(e.target.value)}
            />
            {creationType === 'category' ? (
              <>
                <Label className='mt-4'>
                  Add {tags.length} of 6 filter(s)
                  {tags.length < 1 && (
                    <span className='text-red-500'>
                      {' '}
                      ({1 - tags.length} more is required)
                    </span>
                  )}
                </Label>
                <FilterTagInput tags={tags} setTags={setTags} />
              </>
            ) : (
              <></>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button className='w-fit rounded-[12px]' variant='secondary'>
                Cancel
              </Button>
            </DialogClose>
            <Button
              className='w-fit rounded-[12px]'
              onClick={handleCreation}
              disabled={
                creationInputValue.length < 2 ||
                creationInputValue.trim() === '' ||
                (creationType === 'category' &&
                  (tags.length < 1 || tags.length > 6))
              }
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={badgeDialogOpen} onOpenChange={setBadgeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Filter</DialogTitle>
            <DialogDescription>
              Update the name of this filter to better reflect its purpose or
              content.
            </DialogDescription>
          </DialogHeader>
          <div className='flex flex-col gap-2'>
            <Label>Filter Name</Label>
            <Input
              type='text'
              className='h-11 rounded-[12px]'
              placeholder='New filter name...'
              value={filterInputValue}
              onChange={(e) => setFilterInputValue(e.target.value)}
            />
          </div>

          <DialogFooter className='w-full'>
            <DialogClose asChild>
              <Button
                className='mr-auto w-fit rounded-[12px]'
                variant='secondary'
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              className='w-fit rounded-[12px]'
              variant={'destructive'}
              onClick={handleBadgeDelete}
            >
              Delete
            </Button>
            <Button
              className='w-fit rounded-[12px]'
              onClick={() => {
                handleFilterRename();
              }}
              disabled={
                filterInputValue === filterToEdit?.name ||
                filterInputValue.length < 2 ||
                filterInputValue.trim() === ''
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

const FilterTagInput = (props: {
  tags: any[];
  setTags: (tags: any) => void;
}) => {
  const { tags, setTags } = props;
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  return (
    <TagInput
      maxLength={20}
      minLength={2}
      minTags={1}
      maxTags={6}
      tags={tags}
      setTags={(newTags: any) => {
        setTags(newTags);
      }}
      placeholder='Add a filter'
      styleClasses={{
        inlineTagsContainer: 'min-h-11 rounded-[12px]',
        input: 'w-full shadow-none min-w-[100px]',
        tag: {
          body: 'bg-accent/80 rounded-[10px] pl-4 !lowercase font-medium text-primary hover:text-red-500',
          closeButton: 'hover:text-red-500',
        },
      }}
      activeTagIndex={activeTagIndex}
      setActiveTagIndex={setActiveTagIndex}
    />
  );
};
