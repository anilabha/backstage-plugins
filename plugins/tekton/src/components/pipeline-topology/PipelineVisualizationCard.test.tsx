import React from 'react';

import { render } from '@testing-library/react';

import { mockKubernetesPlrResponse } from '../../__fixtures__/1-pipelinesData';
import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { PipelineVisualizationCard } from './PipelineVisualizationCard';

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: () => ({
    entity: {
      metadata: {
        name: 'test',
      },
    },
  }),
}));

describe('PipelineVisualizationCard', () => {
  it('should render the pipeline run visualization when pipelineRun exists', async () => {
    const mockContextData = {
      watchResourcesData: {
        pipelineruns: {
          data: mockKubernetesPlrResponse.pipelineruns,
        },
        taskruns: {
          data: mockKubernetesPlrResponse.taskruns,
        },
      },
      loaded: true,
      responseError: '',
      selectedClusterErrors: [],
      clusters: [],
      setSelectedCluster: () => {},
    };
    const { queryByTestId, getByText } = render(
      <TektonResourcesContext.Provider value={mockContextData}>
        <PipelineVisualizationCard linkTekton={false} />
      </TektonResourcesContext.Provider>,
    );
    expect(
      getByText(mockKubernetesPlrResponse.pipelineruns[1].metadata.name),
    ).toBeInTheDocument();

    expect(queryByTestId('pipelineRun-visualization')).toBeInTheDocument();
  });

  it('should show empty state when pipelineRun doesnot exist', async () => {
    const mockContextData = {
      watchResourcesData: {
        pipelineruns: {
          data: [],
        },
        taskruns: {
          data: mockKubernetesPlrResponse.taskruns,
        },
      },
      loaded: true,
      responseError: '',
      selectedClusterErrors: [],
      clusters: [],
      setSelectedCluster: () => {},
    };
    const { queryByText } = render(
      <TektonResourcesContext.Provider value={mockContextData}>
        <PipelineVisualizationCard />
      </TektonResourcesContext.Provider>,
    );
    expect(queryByText(/No Pipeline Run to visualize/i)).toBeInTheDocument();
  });

  it('should not render the visualization when no tasks exists for a pipelineRun', async () => {
    const mockContextData = {
      watchResourcesData: {
        pipelineruns: {
          data: mockKubernetesPlrResponse.pipelineruns,
        },
        taskruns: {
          data: mockKubernetesPlrResponse.taskruns,
        },
      },
      loaded: true,
      responseError: '',
      selectedClusterErrors: [],
      clusters: [],
      setSelectedCluster: () => {},
    };
    mockContextData.watchResourcesData.pipelineruns.data[1].status.pipelineSpec =
      {
        ...mockContextData.watchResourcesData.pipelineruns.data[1].status
          .pipelineSpec,
        tasks: [],
      };
    mockContextData.watchResourcesData.pipelineruns.data[1].status.pipelineSpec.finally =
      [];

    const { queryByTestId, getByText } = render(
      <TektonResourcesContext.Provider value={mockContextData}>
        <PipelineVisualizationCard linkTekton={false} />
      </TektonResourcesContext.Provider>,
    );
    expect(
      getByText('This Pipeline Run has no tasks to visualize'),
    ).toBeInTheDocument();

    expect(queryByTestId('pipeline-no-tasks')).toBeInTheDocument();
  });

  it('should show empty state with no cluster selector when there is response error and no clusters are fetched', async () => {
    const mockContextData = {
      watchResourcesData: {
        pipelineruns: {
          data: [],
        },
        taskruns: {
          data: [],
        },
      },
      loaded: true,
      responseError:
        'getaddrinfo ENOTFOUND api.rhoms-4.13-052404.dev.openshiftappsvc.org',
      selectedClusterErrors: [],
      clusters: [],
      setSelectedCluster: () => {},
    };
    const { queryByText } = render(
      <TektonResourcesContext.Provider value={mockContextData}>
        <PipelineVisualizationCard />
      </TektonResourcesContext.Provider>,
    );
    expect(queryByText(/No Pipeline Run to visualize/i)).toBeInTheDocument();
    expect(queryByText(/Cluster/)).toBeNull();
  });

  it('should show empty state with cluster selector when there is response error and clusters are fetched', async () => {
    const mockContextData = {
      watchResourcesData: {
        pipelineruns: {
          data: [],
        },
        taskruns: {
          data: [],
        },
      },
      loaded: true,
      responseError:
        'getaddrinfo ENOTFOUND api.rhoms-4.13-052404.dev.openshiftappsvc.org',
      selectedClusterErrors: [{ message: '403 - forbidden' }],
      clusters: ['OCP'],
      setSelectedCluster: () => {},
    };
    const { queryByText } = render(
      <TektonResourcesContext.Provider value={mockContextData}>
        <PipelineVisualizationCard />
      </TektonResourcesContext.Provider>,
    );
    expect(queryByText(/No Pipeline Run to visualize/i)).toBeInTheDocument();
    expect(queryByText(/Cluster/)).toBeInTheDocument();
  });
});
