    package com.chuyendeweb2.group05.service;

    import jakarta.persistence.EntityNotFoundException;
    import lombok.RequiredArgsConstructor;
    import org.springframework.security.core.userdetails.UserDetails;
    import org.springframework.security.core.userdetails.UserDetailsService;
    import org.springframework.security.core.userdetails.UsernameNotFoundException;
    import org.springframework.stereotype.Service;
    import org.springframework.transaction.annotation.Transactional;

    import com.chuyendeweb2.group05.entity.meta.User;
    import com.chuyendeweb2.group05.repo.UserRepository;

    import java.util.List;

    @Service
    @RequiredArgsConstructor
    public class UserService implements UserDetailsService {

        private final UserRepository userRepository;

        @Override
        public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        }

        public User getCurrentUser(String email) {
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));
        }

        public Integer getUserIdByEmail(String email) {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));
            return user.getId();
        }

        public User getUserById(Integer id) {
            return userRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
        }

        public boolean existsByEmail(String email) {
            return userRepository.existsByEmail(email);
        }

        public List<User> getAllUsers() {
            return userRepository.findAll();
        }

        @Transactional
        public User updateUser(User user) {
            // Check if the user exists
            if (!userRepository.existsById(user.getId())) {
                throw new EntityNotFoundException("User not found with id: " + user.getId());
            }
            return userRepository.save(user);
        }

        @Transactional
        public void deleteUser(Integer id) {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));

            // Remove cart association if exists
            user.removeCart();

            // Remove tokens
            // Note: This assumes you have cascade settings on the Token entity

            userRepository.delete(user);
        }
        
    }