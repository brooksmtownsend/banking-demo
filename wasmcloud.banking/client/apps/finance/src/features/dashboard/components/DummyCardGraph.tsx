import * as React from 'react';
import Chart from 'react-apexcharts';
import {ArrowDownIcon, ArrowUpIcon} from 'lucide-react';
import {Transaction, useTransactions} from '@repo/common/services/user/useTransactions';
import {DashboardCard} from './DashboardCard';

export function DummyCardGraph(): React.ReactElement {
  const {transactions, balance} = useTransactions();

  const series: React.ComponentProps<typeof Chart>['series'] = [
    {
      data: [
        {x: '2022-09-19T00:00:00.000Z', y: 31},
        {x: '2022-09-20T01:30:00.000Z', y: 40},
        {x: '2022-09-21T02:30:00.000Z', y: 28},
        {x: '2022-09-22T03:30:00.000Z', y: 51},
        {x: '2022-09-23T04:30:00.000Z', y: 42},
        {x: '2022-09-24T05:30:00.000Z', y: 109},
        {x: '2022-09-25T06:30:00.000Z', y: 100},
      ],
    },
  ];

  return (
    <DashboardCard cols={7} className="p-0">
      <div className="flex flex-col gap-4 px-8 pt-8 text-center">
        <h4 className="font-heading font-semibold text-sm uppercase text-muted-400">
          Account Balance
        </h4>
        <p>
          <span className="font-mono font-medium text-4xl before:content-['$']">{balance}</span>
        </p>
        <RecentTransaction transaction={transactions[0]} />
      </div>
      <div className="overflow-hidden">
        <Chart
          className="text-primary"
          options={CHART_OPTIONS}
          series={series}
          type="area"
          width="100%"
        />
      </div>
    </DashboardCard>
  );
}

function RecentTransaction({transaction}: {transaction: Transaction}) {
  const formattedDate = new Date(transaction.date * 1000).toLocaleString(undefined, {
    dateStyle: 'medium',
  });
  const amount = transaction.amount;
  const positive = amount >= 1;
  const Icon = positive ? ArrowUpIcon : ArrowDownIcon;
  const iconClass = positive ? 'text-success' : 'text-secondary';

  return (
    <div className="flex items-center justify-center gap-x-2">
      <Icon className={`w-4 h-4 ${iconClass}`} />
      <span className="font-sans text-sm text-foreground/40">
        ${amount} {formattedDate}
      </span>
    </div>
  );
}

const CHART_OPTIONS: React.ComponentProps<typeof Chart>['options'] = {
  chart: {
    height: 250,
    type: 'area',
    toolbar: {show: false},
    parentHeightOffset: 0,
    zoom: {enabled: false},
    animations: {enabled: false},
  },
  stroke: {
    width: [2, 2, 2],
    curve: 'smooth',
  },
  colors: ['currentColor'],
  fill: {
    type: 'gradient',
    gradient: {
      colorStops: [
        {
          offset: 0,
          color: 'currentColor',
          opacity: 1,
        },
        {
          offset: 100,
          color: 'hsl(var(--ui-color-background))',
          opacity: 1,
        },
      ],
    },
  },
  legend: {show: false},
  dataLabels: {enabled: false},
  grid: {
    show: false,
    padding: {left: -10, right: 0, bottom: 10},
  },
  xaxis: {
    type: 'datetime',
    axisBorder: {color: 'hsl(var(--ui-color-border))'},
    axisTicks: {color: 'hsl(var(--ui-color-border))'},
    labels: {
      style: {
        colors: 'currentColor',
        fontFamily: 'unset',
        fontWeight: 'unset',
        cssClass: 'text-foreground/30 font-bold uppercase',
      },
    },
  },
  yaxis: {
    labels: {show: false},
    axisBorder: {show: false},
    axisTicks: {show: false},
  },
  tooltip: {enabled: false},
};