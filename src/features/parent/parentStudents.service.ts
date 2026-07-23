/** Parent's own profile + children — real backend. The parent is always resolved from the JWT, never a client-supplied id. */
import {useQuery} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {ParentChild, ParentSelfProfile, Status} from '../../shared/types';

/** Raw shape the real backend responds with — gender/status come back upper-case. */
interface ParentChildApi {
  id: string;
  admissionNo: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  rollNo: number;
  bloodGroup?: string;
  address?: string;
  status: string;
  attendancePercentage: number;
}

interface ParentProfileApi {
  parent: ParentSelfProfile;
  children: ParentChildApi[];
}

export interface ParentProfileData {
  parent: ParentSelfProfile;
  children: ParentChild[];
}

function toParentChild(raw: ParentChildApi): ParentChild {
  return {
    id: raw.id,
    admissionNo: raw.admissionNo,
    name: raw.name,
    gender: raw.gender.toLowerCase() as ParentChild['gender'],
    dateOfBirth: raw.dateOfBirth,
    classId: raw.classId,
    className: raw.className,
    sectionId: raw.sectionId,
    sectionName: raw.sectionName,
    rollNo: raw.rollNo,
    bloodGroup: raw.bloodGroup,
    address: raw.address,
    status: raw.status.toLowerCase() as Status,
    attendancePercentage: raw.attendancePercentage,
  };
}

export const parentStudentsApi = {
  getProfile: async (): Promise<ParentProfileData> => {
    try {
      const {data} = await axiosClient.get<ParentProfileApi>(Endpoints.students.profile);
      return {parent: data.parent, children: data.children.map(toParentChild)};
    } catch (e) {
      console.error('parentStudentsApi.getProfile failed', e);
      rethrowApiError(e, 'Failed to load your profile.');
    }
  },
};

export const useParentProfile = () =>
  useQuery({queryKey: ['parentProfile'], queryFn: parentStudentsApi.getProfile});
