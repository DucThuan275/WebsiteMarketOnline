# Hệ Thống Quản Lý Bán Hàng - Spring Boot & MySQL

## Giới Thiệu
Đây là một hệ thống quản lý bán hàng sử dụng Spring Boot cho backend và MySQL cho cơ sở dữ liệu. Hệ thống hỗ trợ các tính năng như đăng nhập người dùng, quản lý sản phẩm, thanh toán trực tuyến thông qua cổng thanh toán VNPAY, gửi email xác nhận, và quản lý đơn hàng.

## Kiến Trúc
Hệ thống sử dụng kiến trúc Client-Server với phần frontend và backend tách biệt.
- **Frontend**: Sử dụng các công nghệ như React.js (hoặc tương tự) để xây dựng giao diện người dùng. Các API từ backend sẽ được gọi để giao tiếp và hiển thị dữ liệu.
- **Backend**: Được xây dựng bằng Spring Boot, cung cấp các dịch vụ RESTful API cho frontend và xử lý các yêu cầu từ người dùng. Các tính năng bảo mật, thanh toán và gửi email được xử lý từ backend.

## Công Nghệ Sử Dụng

### Backend
- **Spring Boot**: Framework chính để phát triển ứng dụng backend, giúp phát triển nhanh chóng và dễ dàng cấu hình.
- **Spring Security**: Cung cấp bảo mật cho các API, bao gồm xác thực người dùng và phân quyền truy cập bằng JWT (JSON Web Token).
- **Spring Data JPA**: Thư viện ORM để kết nối và thao tác với cơ sở dữ liệu MySQL.
- **MySQL**: Cơ sở dữ liệu quan hệ dùng để lưu trữ dữ liệu của hệ thống.
- **Spring Boot Starter Web**: Hỗ trợ phát triển các API RESTful và giao tiếp giữa frontend và backend.
- **Spring Boot Starter Mail**: Cung cấp khả năng gửi email từ ứng dụng backend.
- **Springdoc OpenAPI**: Tự động tạo tài liệu API với Swagger UI, giúp kiểm tra và sử dụng API dễ dàng.
- **JWT (JSON Web Token)**: Dùng để xác thực và bảo vệ các API với cơ chế token.
- **VNPAY**: Cổng thanh toán trực tuyến cho phép người dùng thực hiện các giao dịch thanh toán qua internet.

### Các Thư Viện Quan Trọng
- **JJWT**: Thư viện mã hóa và giải mã JWT, sử dụng trong cơ chế bảo mật.
- **Google OAuth**: Xác thực người dùng qua Google (OAuth2).
- **VNPAY**: Cổng thanh toán VNPAY cho phép thanh toán trực tuyến.
- **Spring Boot Starter Mail**: Gửi email từ backend, ví dụ như email xác nhận đăng ký.

## Các Chức Năng Chính

### Quản Lý Người Dùng
- Đăng nhập/Đăng ký: Người dùng có thể đăng ký tài khoản và đăng nhập qua email hoặc dịch vụ OAuth (Google).
- Quản lý tài khoản người dùng: Người dùng có thể cập nhật thông tin cá nhân, thay đổi mật khẩu và quản lý quyền truy cập.

### Bảo Mật và Quản Lý Phiên (Session)
- **Xác thực JWT**: Sau khi đăng nhập, người dùng nhận được token JWT để xác thực cho các yêu cầu API tiếp theo.
- **Phân quyền người dùng**: Các endpoint bảo mật yêu cầu quyền truy cập hợp lệ, ví dụ như chỉ admin mới có thể quản lý sản phẩm hoặc xóa người dùng.

### Thanh Toán VNPAY
- **Thanh toán trực tuyến**: Tích hợp cổng thanh toán VNPAY cho phép người dùng thực hiện thanh toán qua internet.
- **Callback từ VNPAY**: Sau khi thanh toán thành công, hệ thống nhận lại thông tin từ VNPAY và lưu thông tin giao dịch vào cơ sở dữ liệu.

### Gửi Email
- **Gửi email xác nhận**: Hệ thống gửi email xác nhận khi người dùng đăng ký hoặc thực hiện các hành động quan trọng.

### Quản Lý Sản Phẩm và Đơn Hàng
- **Thêm, sửa, xóa sản phẩm**: Các admin có thể quản lý sản phẩm trong hệ thống.
- **Quản lý đơn hàng**: Người dùng có thể đặt hàng, theo dõi trạng thái đơn hàng và xem lịch sử giao dịch.

## Cấu Hình Dự Án

### Cấu Hình Cơ Sở Dữ Liệu (MySQL)
Datasource: Cấu hình kết nối đến MySQL trong `application.yml`, bao gồm URL, tên đăng nhập, mật khẩu, và driver class.

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/your_database
    username: your_username
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
```
Cấu Hình Bảo Mật JWT
Secret Key: Cấu hình khóa bí mật để mã hóa và giải mã JWT trong application.yml.
```yaml
jwt:
  secret: your_secret_key
  expiration: 3600
```
Cấu Hình Thanh Toán VNPAY
VNPAY: Cấu hình các thông số kết nối VNPAY trong application.yml (mã giao dịch, khóa bí mật, URL thanh toán).
```yaml
vnpay:
  tmn-code: your_tmn_code
  hash-secret: your_hash_secret
  url: your_payment_url

```
Cấu Hình Gửi Email
SMTP: Cấu hình gửi email qua Gmail SMTP server.
```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your_email@gmail.com
    password: your_email_password
    protocol: smtp
    tls: true

```
Hướng Dẫn Cài Đặt
1. Clone dự án về máy:
   
bash
   git clone https://github.com/your-username/your-project-name.git


2. Cài đặt các phụ thuộc bằng Maven:
   
bash
   mvn clean install


3. Chạy ứng dụng Spring Boot:
   
bash
   mvn spring-boot:run


4. Mở trình duyệt và truy cập vào http://localhost:8080 để sử dụng hệ thống.
API Tài Liệu
API được tự động tạo và tài liệu hóa bằng Springdoc OpenAPI. Bạn có thể xem tài liệu API tại đường dẫn:
http://localhost:8080/swagger-ui.html

Tính Năng Sắp Tới
- Tính năng báo cáo thống kê bán hàng.
- Tích hợp các phương thức thanh toán khác.
- Cải thiện hiệu suất và khả năng mở rộng.
Liên Hệ
Nếu bạn gặp bất kỳ vấn đề nào, hãy mở một issue hoặc liên hệ với chúng tôi qua email: 
Voducthuan2705@gmail.com
