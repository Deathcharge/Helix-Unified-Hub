package com.helixhub.mobile;

import android.view.*;
import android.widget.*;
import androidx.recyclerview.widget.RecyclerView;
import java.util.ArrayList;

public class PortalAdapter extends RecyclerView.Adapter<PortalAdapter.PortalViewHolder> {
    private ArrayList<PortalStatus> portals;
    private OnItemClickListener listener;
    
    public interface OnItemClickListener {
        void onItemClick(int position);
    }
    
    public void setOnItemClickListener(OnItemClickListener listener) {
        this.listener = listener;
    }
    
    public PortalAdapter(ArrayList<PortalStatus> portals) {
        this.portals = portals;
    }
    
    @Override
    public PortalViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.portal_item, parent, false);
        return new PortalViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(PortalViewHolder holder, int position) {
        PortalStatus portal = portals.get(position);
        
        holder.nameText.setText(portal.getName());
        holder.domainText.setText(portal.getDomain());
        holder.descriptionText.setText(portal.getDescription());
        holder.statusText.setText(portal.getDeploymentStatus());
        
        // Set status color based on deployment
        if (portal.isDeployed()) {
            holder.statusIndicator.setBackgroundColor(0xFF4CAF50); // Green
        } else {
            holder.statusIndicator.setBackgroundColor(0xFFFF9800); // Orange
        }
        
        // Set click listener
        holder.itemView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onItemClick(position);
            }
        });
    }
    
    @Override
    public int getItemCount() {
        return portals.size();
    }
    
    public static class PortalViewHolder extends RecyclerView.ViewHolder {
        TextView nameText;
        TextView domainText;
        TextView descriptionText;
        TextView statusText;
        View statusIndicator;
        
        public PortalViewHolder(View itemView) {
            super(itemView);
            nameText = itemView.findViewById(R.id.portalName);
            domainText = itemView.findViewById(R.id.portalDomain);
            descriptionText = itemView.findViewById(R.id.portalDescription);
            statusText = itemView.findViewById(R.id.portalStatus);
            statusIndicator = itemView.findViewById(R.id.statusIndicator);
        }
    }
}