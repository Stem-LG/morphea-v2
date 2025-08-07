import { useMutation, useQueryClient } from "@tanstack/react-query";

interface VariantApprovalData {
    yvarprodprixcatalogue: number;
    yvarprodprixpromotion: number | null;
    yvarprodpromotiondatedeb: string | null;
    yvarprodpromotiondatefin: string | null;
    yvarprodnbrjourlivraison: number;
    currencyId: number;
}

