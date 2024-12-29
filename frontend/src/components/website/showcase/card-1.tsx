import { AreaChart } from '@/components/ui/area-chart';

export default function Card1(props: { className?: string }) {
  const metricsData = [
    { date: '2024-12-01', createdAccounts: 120, deletedAccounts: 10 },
    { date: '2024-12-02', createdAccounts: 98, deletedAccounts: 15 },
    { date: '2024-12-03', createdAccounts: 130, deletedAccounts: 8 },
    { date: '2024-12-04', createdAccounts: 110, deletedAccounts: 12 },
    { date: '2024-12-05', createdAccounts: 125, deletedAccounts: 9 },
    { date: '2024-12-06', createdAccounts: 140, deletedAccounts: 14 },
    { date: '2024-12-07', createdAccounts: 150, deletedAccounts: 7 },
    { date: '2024-12-08', createdAccounts: 135, deletedAccounts: 10 },
    { date: '2024-12-09', createdAccounts: 128, deletedAccounts: 11 },
    { date: '2024-12-10', createdAccounts: 115, deletedAccounts: 6 },
    { date: '2024-12-11', createdAccounts: 105, deletedAccounts: 13 },
    { date: '2024-12-12', createdAccounts: 100, deletedAccounts: 12 },
    { date: '2024-12-13', createdAccounts: 130, deletedAccounts: 15 },
    { date: '2024-12-14', createdAccounts: 145, deletedAccounts: 8 },
    { date: '2024-12-15', createdAccounts: 138, deletedAccounts: 9 },
    { date: '2024-12-16', createdAccounts: 120, deletedAccounts: 10 },
    { date: '2024-12-17', createdAccounts: 125, deletedAccounts: 14 },
    { date: '2024-12-18', createdAccounts: 115, deletedAccounts: 7 },
    { date: '2024-12-19', createdAccounts: 140, deletedAccounts: 10 },
    { date: '2024-12-20', createdAccounts: 130, deletedAccounts: 6 },
    { date: '2024-12-21', createdAccounts: 135, deletedAccounts: 11 },
    { date: '2024-12-22', createdAccounts: 120, deletedAccounts: 9 },
    { date: '2024-12-23', createdAccounts: 100, deletedAccounts: 8 },
    { date: '2024-12-24', createdAccounts: 110, deletedAccounts: 12 },
    { date: '2024-12-25', createdAccounts: 130, deletedAccounts: 5 },
    { date: '2024-12-26', createdAccounts: 145, deletedAccounts: 13 },
    { date: '2024-12-27', createdAccounts: 138, deletedAccounts: 9 },
    { date: '2024-12-28', createdAccounts: 125, deletedAccounts: 7 },
    { date: '2024-12-29', createdAccounts: 115, deletedAccounts: 11 },
    { date: '2024-12-30', createdAccounts: 105, deletedAccounts: 14 },
    { date: '2024-12-31', createdAccounts: 120, deletedAccounts: 10 },
  ];
  const valueFormatter = (number: number) => {
    return Intl.NumberFormat('us').format(number).toString();
  };
  return (
    <AreaChart
      className='h-52 w-[320px] bg-background p-3 rounded-2xl shadow-sm rotate-[-9deg]'
      data={metricsData}
      index='date'
      colors={['red', 'blue']}
      categories={['createdAccounts', 'deletedAccounts']}
      valueFormatter={(number: number) => valueFormatter(number)}
      yAxisLabel='Total'
    />
  );
}
