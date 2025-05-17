package com.shared.function.DTL;

import lombok.Getter;
import lombok.Setter;

import com.shared.function.entity.User;

@Getter
@Setter
public class UserOverview {
    private Integer id;
    private String name;
    private String email;
    
    public UserOverview(User user) {
        this.id = user.getId();
        this.name = user.getUserName();
        this.email = user.getEmail();
    }
}
