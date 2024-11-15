import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthCredentialsDto } from "./dto/auth-credentials.dto";
import { AuthService } from "./auth.service";
import { ApiBody, ApiOkResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";

@Controller('auth')
@ApiTags("Auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
		summary: "Registra un utente",
	})
  @ApiBody({
    type:AuthCredentialsDto,
    description: "Credenziali utente"
  })
  @ApiResponse({
    status:HttpStatus.CREATED,
    description: 'Utente creato'
  })
  @ApiResponse({
       status: HttpStatus.CONFLICT,
    description: 'Utente già presente'
  })
  @Post('/signup')
  @HttpCode(HttpStatus.CREATED)
  signUp(@Body() authCredentialsDto: AuthCredentialsDto): Promise<void> {
    return this.authService.createUser(authCredentialsDto);
  }

  @ApiOperation({
		summary: "Esegue il login un utente restituendo il token dell'utente connesso",
	})
  @ApiOkResponse({
    description: "Token di autenticazione",
		type: String,
  })
  @ApiUnauthorizedResponse({
    description:'L\'utente non esiste'
  })
  @ApiBody({
    type:AuthCredentialsDto,
    description: "Credenziali utente"
  })
  @Post('/signin')
  signin(@Body() authCredentialsDto: AuthCredentialsDto): Promise<{accessToken: string}> {
    return this.authService.signIn(authCredentialsDto);
  }
}
